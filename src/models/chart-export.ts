import { Chart, ChartConfiguration } from 'chart.js'

/**
 * Triggers a browser download for the given object URL or data URL.
 */
const downloadUrl = (url: string, fileName: string) => {
    const a = document.createElement('a')
    a.download = fileName
    a.href = url
    a.click()
}

/**
 * Deep-copies a chart configuration's dataset values so the offscreen chart
 * never mutates the data owned by the on-screen chart.
 */
const cloneConfig = (
    config: ChartConfiguration<'bar'>,
): ChartConfiguration<'bar'> => ({
    ...config,
    data: {
        ...config.data,
        datasets: config.data.datasets.map((dataset) => ({
            ...dataset,
            data: [...dataset.data],
        })),
    },
})

/**
 * Renders a chart onto a detached canvas of the exact pixel size.
 * Animation and responsiveness are disabled so the result is deterministic.
 */
const renderOffscreenChart = (
    config: ChartConfiguration<'bar'>,
    width: number,
    height: number,
): { chart: Chart<'bar'>; canvas: HTMLCanvasElement } => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const chart = new Chart(canvas, {
        ...cloneConfig(config),
        options: {
            ...config.options,
            responsive: false,
            maintainAspectRatio: false,
            animation: false,
            devicePixelRatio: 1,
        },
    })
    chart.update('none')
    return { chart, canvas }
}

/**
 * Number of bars to reveal at the given animation progress (0 = start,
 * 1 = fully revealed). At least one bar is always shown.
 */
export const revealCountAt = (total: number, progress: number): number =>
    Math.max(1, Math.round(total * Math.min(Math.max(progress, 0), 1)))

/**
 * Returns a copy of the dataset where bars past `revealCount` are hidden
 * (set to null), producing the left-to-right reveal effect.
 */
export const revealedData = (
    fullData: number[],
    revealCount: number,
): number[] =>
    fullData.map((v, i) => (i < revealCount ? v : (null as unknown as number)))

/**
 * Exports the chart as a PNG image at the specified size.
 */
export const exportChartPng = (
    config: ChartConfiguration<'bar'>,
    width: number,
    height: number,
    fileName: string,
): void => {
    const { chart, canvas } = renderOffscreenChart(config, width, height)
    try {
        downloadUrl(canvas.toDataURL('image/png'), fileName)
    } finally {
        chart.destroy()
    }
}

const MACROBLOCK = 16

/** [levelHex, maxMacroblocksPerSecond, maxFrameMacroblocks] per H.264 Annex A. */
type H264Level = readonly [number, number, number]

const H264_LEVELS: readonly H264Level[] = [
    [0x1e, 40_500, 1620], // 3.0
    [0x1f, 108_000, 3600], // 3.1
    [0x20, 216_000, 5120], // 3.2
    [0x28, 245_760, 8192], // 4.0
    [0x29, 245_760, 8192], // 4.1
    [0x2a, 522_240, 8704], // 4.2
    [0x32, 589_824, 22_080], // 5.0
    [0x33, 983_040, 36_864], // 5.1
    [0x34, 2_073_600, 36_864], // 5.2
    [0x3c, 4_177_920, 139_264], // 6.0
    [0x3d, 8_355_840, 139_264], // 6.1
]

/** 6.2 — the highest defined level; used when nothing smaller fits. */
const MAX_H264_LEVEL: H264Level = [0x3e, 16_711_680, 139_264]

/** Smallest H.264 level whose frame-size and rate limits fit the output. */
const h264LevelHex = (
    width: number,
    height: number,
    frameRate: number,
): number => {
    const frameMbs =
        Math.ceil(width / MACROBLOCK) * Math.ceil(height / MACROBLOCK)
    const mbPerSec = frameMbs * frameRate
    const level =
        H264_LEVELS.find(
            ([, maxRate, maxFrame]) =>
                mbPerSec <= maxRate && frameMbs <= maxFrame,
        ) ?? MAX_H264_LEVEL
    return level[0]
}

/**
 * H.264 codec candidates for the given output, ordered from higher to lower
 * capability (High → Main → Baseline). The level is derived from the frame
 * size and rate so exports work at any resolution, not just up to 1080p.
 */
const codecCandidates = (
    width: number,
    height: number,
    frameRate: number,
): string[] => {
    const level = h264LevelHex(width, height, frameRate)
        .toString(16)
        .padStart(2, '0')
    return [`avc1.6400${level}`, `avc1.4d00${level}`, `avc1.4200${level}`]
}

/** Tuned so the default 2560x1440@60 yields ~12 Mbps; scales with pixels. */
const BITS_PER_PIXEL_PER_FRAME = 12_000_000 / (2560 * 1440 * 60)

const videoBitrate = (
    width: number,
    height: number,
    frameRate: number,
): number =>
    Math.max(
        Math.round(width * height * frameRate * BITS_PER_PIXEL_PER_FRAME),
        2_000_000,
    )

const pickSupportedCodec = async (
    width: number,
    height: number,
    frameRate: number,
    bitrate: number,
): Promise<string | undefined> => {
    for (const codec of codecCandidates(width, height, frameRate)) {
        try {
            const support = await VideoEncoder.isConfigSupported({
                codec,
                width,
                height,
                framerate: frameRate,
                bitrate,
            })
            if (support.supported) {
                return codec
            }
        } catch {
            // Unsupported codec string throws; try the next candidate.
        }
    }

    return undefined
}

export interface VideoExportOptions {
    width: number
    height: number
    fps: number
    /** Seconds spent revealing the bars from left to right. */
    animationSec: number
    /** Seconds the completed graph stays on screen after the animation. */
    holdSec: number
    fileName: string
    onProgress?: (ratio: number) => void
}

/**
 * Exports an animated MP4 that reveals the bars from left to right, then holds
 * the completed graph on screen.
 *
 * Frames are rendered deterministically (not in real time): during the
 * animation phase an increasing slice of the dataset is revealed, and during
 * the hold phase all bars stay visible. Frames are encoded to H.264 via
 * WebCodecs and muxed into an MP4 container. Throws with a meaningful message
 * when the browser lacks WebCodecs / H.264 support.
 */
export const exportChartMp4 = async (
    config: ChartConfiguration<'bar'>,
    {
        width,
        height,
        fps,
        animationSec,
        holdSec,
        fileName,
        onProgress,
    }: VideoExportOptions,
): Promise<void> => {
    if (typeof VideoEncoder === 'undefined') {
        throw new Error(
            'お使いのブラウザは動画エンコード(WebCodecs)に対応していません。Chrome/Edge/Safari 16.4以降をお使いください。',
        )
    }

    // H.264 requires even dimensions.
    const videoWidth = width - (width % 2)
    const videoHeight = height - (height % 2)
    const bitrate = videoBitrate(videoWidth, videoHeight, fps)

    const codec = await pickSupportedCodec(
        videoWidth,
        videoHeight,
        fps,
        bitrate,
    )
    if (codec === undefined) {
        throw new Error(
            'H.264エンコードに対応していないため、この環境では動画を生成できません。',
        )
    }

    const { Muxer, ArrayBufferTarget } = await import('mp4-muxer')

    const { chart, canvas } = renderOffscreenChart(
        config,
        videoWidth,
        videoHeight,
    )
    const fullData = [...(chart.data.datasets[0].data as number[])]
    const animationFrames = Math.max(1, Math.round(fps * animationSec))
    const holdFrames = Math.max(0, Math.round(fps * holdSec))
    const totalFrames = animationFrames + holdFrames
    const frameDuration = Math.round(1_000_000 / fps)

    const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        video: {
            codec: 'avc',
            width: videoWidth,
            height: videoHeight,
            frameRate: fps,
        },
        fastStart: 'in-memory',
    })

    let encodeError: unknown
    const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => {
            encodeError = e
        },
    })
    encoder.configure({
        codec,
        width: videoWidth,
        height: videoHeight,
        framerate: fps,
        bitrate,
    })

    try {
        for (let frame = 0; frame < totalFrames; frame++) {
            if (encodeError !== undefined) {
                throw encodeError
            }

            const revealCount =
                frame < animationFrames
                    ? revealCountAt(
                          fullData.length,
                          (frame + 1) / animationFrames,
                      )
                    : fullData.length
            chart.data.datasets[0].data = revealedData(fullData, revealCount)
            chart.update('none')

            const videoFrame = new VideoFrame(canvas, {
                timestamp: frame * frameDuration,
                duration: frameDuration,
            })
            encoder.encode(videoFrame, { keyFrame: frame % fps === 0 })
            videoFrame.close()

            // Relieve encoder backpressure and let the UI update.
            if (encoder.encodeQueueSize > fps) {
                await new Promise((resolve) => setTimeout(resolve, 0))
            }
            onProgress?.((frame + 1) / totalFrames)
        }

        await encoder.flush()
        if (encodeError !== undefined) {
            throw encodeError
        }
        muxer.finalize()

        const blob = new Blob([muxer.target.buffer], { type: 'video/mp4' })
        const url = URL.createObjectURL(blob)
        try {
            downloadUrl(url, fileName)
        } finally {
            URL.revokeObjectURL(url)
        }
    } finally {
        encoder.close()
        chart.destroy()
    }
}
