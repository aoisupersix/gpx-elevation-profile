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

/**
 * H.264 codec candidates ordered from higher to lower capability.
 * The first one supported by the platform encoder is used.
 */
const codecCandidates = ['avc1.640028', 'avc1.4d0028', 'avc1.42001f']

const pickSupportedCodec = async (
    width: number,
    height: number,
    frameRate: number,
    bitrate: number,
): Promise<string | undefined> => {
    for (const codec of codecCandidates) {
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
    durationSec: number
    fileName: string
    onProgress?: (ratio: number) => void
}

/**
 * Exports an animated MP4 that reveals the bars from left to right.
 *
 * Frames are rendered deterministically (not in real time) by revealing an
 * increasing slice of the dataset, then encoded to H.264 via WebCodecs and
 * muxed into an MP4 container. Throws with a meaningful message when the
 * browser lacks WebCodecs / H.264 support.
 */
export const exportChartMp4 = async (
    config: ChartConfiguration<'bar'>,
    {
        width,
        height,
        fps,
        durationSec,
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
    const bitrate = Math.min(
        20_000_000,
        Math.round(videoWidth * videoHeight * fps * 0.1),
    )

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
    const totalFrames = Math.max(1, Math.round(fps * durationSec))
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

            const revealCount = Math.max(
                1,
                Math.round((fullData.length * (frame + 1)) / totalFrames),
            )
            chart.data.datasets[0].data = fullData.map((v, i) =>
                i < revealCount ? v : (null as unknown as number),
            )
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
