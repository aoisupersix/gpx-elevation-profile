import * as React from 'react'

import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import StopIcon from '@mui/icons-material/Stop'
import { Box, Button, LinearProgress, Stack } from '@mui/material'
import { Chart, ChartConfiguration } from 'chart.js'

import { revealCountAt, revealedData } from '../models/chart-export'

interface ChartAnimationPreviewProps {
    config: ChartConfiguration<'bar'>
    /** Seconds the initial (pre-animation) frame is held before revealing. */
    startDelaySec: number
    /** Seconds spent revealing the bars from left to right. */
    animationSec: number
    /** Seconds the completed graph stays on screen after the animation. */
    holdSec: number
    /** Output aspect ratio (width / height) to mirror the exported video. */
    aspectRatio: number
    disabled?: boolean
}

/**
 * Real-time on-screen preview of the MP4 reveal animation.
 *
 * Renders the export chart configuration onto a visible canvas and plays back
 * the same left-to-right reveal (then hold) that {@link exportChartMp4}
 * produces, driven by wall-clock time via requestAnimationFrame. Uses the
 * shared reveal helpers so the preview matches the exported result.
 */
export const ChartAnimationPreview: React.FC<ChartAnimationPreviewProps> = (
    props,
) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const chartRef = React.useRef<Chart<'bar'> | null>(null)
    const fullDataRef = React.useRef<number[]>([])
    const rafRef = React.useRef<number | null>(null)
    const [isPlaying, setIsPlaying] = React.useState(false)
    const [hasPlayed, setHasPlayed] = React.useState(false)
    const [progressPercent, setProgressPercent] = React.useState(0)

    const stopAnimation = React.useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
    }, [])

    const renderReveal = React.useCallback((revealCount: number) => {
        const chart = chartRef.current
        if (chart === null) {
            return
        }
        chart.data.datasets[0].data = revealedData(
            fullDataRef.current,
            revealCount,
        )
        chart.update('none')
    }, [])

    // (Re)create the chart whenever the configuration changes.
    React.useEffect(() => {
        const canvas = canvasRef.current
        if (canvas === null) {
            return
        }

        const fullData = [...(props.config.data.datasets[0].data as number[])]
        fullDataRef.current = fullData

        const chart = new Chart(canvas, {
            ...props.config,
            data: {
                ...props.config.data,
                datasets: props.config.data.datasets.map((dataset) => ({
                    ...dataset,
                    data: [...(dataset.data as number[])],
                })),
            },
            options: {
                ...props.config.options,
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: props.aspectRatio,
                animation: false,
            },
        })
        chartRef.current = chart
        setIsPlaying(false)
        setHasPlayed(false)
        setProgressPercent(0)

        return () => {
            stopAnimation()
            chart.destroy()
            chartRef.current = null
        }
    }, [props.config, props.aspectRatio, stopAnimation])

    const play = React.useCallback(() => {
        const chart = chartRef.current
        if (chart === null) {
            return
        }
        stopAnimation()
        setIsPlaying(true)
        setHasPlayed(true)

        const totalSec =
            props.startDelaySec + props.animationSec + props.holdSec
        let startTime: number | null = null

        const step = (now: number) => {
            if (startTime === null) {
                startTime = now
            }
            const elapsedSec = (now - startTime) / 1000
            const animationElapsedSec = elapsedSec - props.startDelaySec
            const revealProgress =
                animationElapsedSec <= 0
                    ? 0
                    : props.animationSec > 0
                      ? animationElapsedSec / props.animationSec
                      : 1
            const revealCount =
                revealProgress >= 1
                    ? fullDataRef.current.length
                    : revealCountAt(fullDataRef.current.length, revealProgress)
            renderReveal(revealCount)

            const overall = totalSec > 0 ? elapsedSec / totalSec : 1
            setProgressPercent(Math.min(100, Math.round(overall * 100)))

            if (elapsedSec < totalSec) {
                rafRef.current = requestAnimationFrame(step)
            } else {
                setProgressPercent(100)
                setIsPlaying(false)
                rafRef.current = null
            }
        }

        rafRef.current = requestAnimationFrame(step)
    }, [
        props.startDelaySec,
        props.animationSec,
        props.holdSec,
        renderReveal,
        stopAnimation,
    ])

    // Abort playback and restore the completed (fully revealed) chart.
    const stop = React.useCallback(() => {
        stopAnimation()
        renderReveal(fullDataRef.current.length)
        setProgressPercent(0)
        setIsPlaying(false)
    }, [renderReveal, stopAnimation])

    return (
        <Stack spacing={1}>
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 640,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden',
                }}
            >
                <canvas ref={canvasRef} />
            </Box>
            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={hasPlayed ? <ReplayIcon /> : <PlayArrowIcon />}
                    onClick={play}
                    disabled={props.disabled}
                >
                    {isPlaying
                        ? '最初から再生'
                        : hasPlayed
                          ? 'もう一度再生'
                          : 'プレビュー再生'}
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<StopIcon />}
                    onClick={stop}
                    disabled={props.disabled || !isPlaying}
                >
                    中断
                </Button>
                <LinearProgress
                    variant="determinate"
                    value={progressPercent}
                    sx={{ flexGrow: 1 }}
                />
            </Stack>
        </Stack>
    )
}
