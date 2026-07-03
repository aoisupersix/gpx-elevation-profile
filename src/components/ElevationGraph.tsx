import * as React from 'react'

import DownloadIcon from '@mui/icons-material/Download'
import VideocamIcon from '@mui/icons-material/Videocam'
import {
    Button,
    CircularProgress,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart,
    ChartConfiguration,
    ChartData,
    ChartOptions,
    Color,
    LinearScale,
    Plugin,
    Tooltip,
} from 'chart.js'
import 'react-json-pretty/themes/monikai.css'
import { Bar } from 'react-chartjs-2'
import styled from 'styled-components'

import { exportChartMp4, exportChartPng } from '../models/chart-export'
import { DistancePoint } from '../models/distance-point'
import { getElevationColor } from '../models/elevation-color'
import { ProfileSetting } from '../models/profile-setting'
import { ceilToMultiple, chunk, roundByDigits } from '../models/util'

const videoFps = 30

interface ElevationViewerProps {
    points: DistancePoint[]
    setting: ProfileSetting
}

const ChartCanvas = styled.article`
    position: relative;
    width: 90vw;
`

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip)

const pointLabelNumbers = 7

export const ElevationGraph: React.FC<ElevationViewerProps> = (props) => {
    const minElevation = props.points.reduce<number>(
        (min, p) => Math.min(min, p.elevation),
        Number.MAX_SAFE_INTEGER,
    )
    const tickDistances = chunk(
        props.points,
        Math.floor(props.points.length / pointLabelNumbers),
    )
        .filter((_, idx) => idx !== 0)
        .map((c) => c[0].totalDistance)
    const barOptions: ChartOptions<'bar'> = {
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            xAxis: {
                title: {
                    display: true,
                    text: '距離(km)',
                    font: {
                        size: 20,
                    },
                },
                grid: {
                    offset: false,
                    z: 1,
                },
                ticks: {
                    callback: (_, idx) => {
                        const point = props.points[idx]
                        if (tickDistances.includes(point.totalDistance)) {
                            return `${roundByDigits(
                                point.totalDistance / 1000,
                                1,
                            )}km`
                        }

                        return null
                    },
                    font: {
                        size: 20,
                    },
                },
            },
            yAxis: {
                title: {
                    display: true,
                    text: '標高(m)',
                    font: {
                        size: 20,
                    },
                },
                grid: {
                    z: 1,
                },
                ticks: {
                    font: {
                        size: 20,
                    },
                },
                min: Math.max(0, ceilToMultiple(minElevation - 100, 100)),
            },
        },
    }

    const barPlugins: Plugin<'bar'>[] = [
        {
            id: 'render-background',
            beforeDraw: (chart) => {
                const bgColor = props.setting.profileBgColor
                chart.ctx.save()
                chart.ctx.globalCompositeOperation = 'destination-over'
                chart.ctx.fillStyle = `rgba(${bgColor.r},${bgColor.g},${bgColor.b},${bgColor.a})`
                chart.ctx.fillRect(0, 0, chart.width, chart.height)
                chart.ctx.restore()
            },
        },
    ]

    const labels = props.points.map(
        (p) =>
            `合計距離:${roundByDigits(
                p.totalDistance,
                1,
            )}m 標高:${roundByDigits(p.elevation, 1)}m 平均勾配:${roundByDigits(
                p.averageSlope,
                1,
            )}%`,
    )
    const colors: Color[] = props.points.map((p) => {
        const color = getElevationColor(
            props.setting.elevationColors,
            p.averageSlope,
        )?.color
        if (color === undefined) {
            return 'gray'
        }

        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
    })
    const elevations = props.points.map((p) => p.elevation)

    const barData: ChartData<'bar', number[], unknown> = {
        labels: labels,
        datasets: [
            {
                backgroundColor: colors,
                barPercentage: 1,
                categoryPercentage: 1,
                data: elevations,
            },
        ],
    }

    // Fix the y-axis max so the scale stays stable while the video reveals
    // bars progressively (otherwise chart.js rescales per visible frame).
    const maxElevation = props.points.reduce<number>(
        (max, p) => Math.max(max, p.elevation),
        Number.MIN_SAFE_INTEGER,
    )
    const exportConfig: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: barData,
        options: {
            ...barOptions,
            scales: {
                ...barOptions.scales,
                yAxis: {
                    ...barOptions.scales?.yAxis,
                    max: ceilToMultiple(maxElevation + 100, 100),
                },
            },
        },
        plugins: barPlugins,
    }

    const [exportWidth, setExportWidth] = React.useState(1920)
    const [exportHeight, setExportHeight] = React.useState(1080)
    const [durationSec, setDurationSec] = React.useState(6)
    const [isRecording, setIsRecording] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const [exportError, setExportError] = React.useState<string | null>(null)

    const sizeIsValid = exportWidth > 0 && exportHeight > 0
    const canExportVideo = sizeIsValid && durationSec > 0 && !isRecording

    const onDownloadPng = () => {
        setExportError(null)
        try {
            exportChartPng(
                exportConfig,
                exportWidth,
                exportHeight,
                'elevation-graph.png',
            )
        } catch (e) {
            setExportError(
                e instanceof Error
                    ? e.message
                    : '画像の書き出しに失敗しました。',
            )
        }
    }

    const onDownloadMp4 = async () => {
        setExportError(null)
        setIsRecording(true)
        setProgress(0)
        try {
            await exportChartMp4(exportConfig, {
                width: exportWidth,
                height: exportHeight,
                fps: videoFps,
                durationSec,
                fileName: 'elevation-graph.mp4',
                onProgress: setProgress,
            })
        } catch (e) {
            setExportError(
                e instanceof Error
                    ? e.message
                    : '動画の書き出しに失敗しました。',
            )
        } finally {
            setIsRecording(false)
        }
    }

    const parsePositiveInt = (value: string): number => {
        const parsed = Number.parseInt(value, 10)
        return Number.isNaN(parsed) ? 0 : parsed
    }

    return (
        <div>
            <ChartCanvas className="chart-container">
                <Bar
                    redraw
                    data={barData}
                    options={barOptions}
                    plugins={barPlugins}
                />
            </ChartCanvas>
            <Stack spacing={2}>
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
                    <TextField
                        type="number"
                        label="幅(px)"
                        size="small"
                        value={exportWidth}
                        onChange={(e) =>
                            setExportWidth(parsePositiveInt(e.target.value))
                        }
                    />
                    <TextField
                        type="number"
                        label="高さ(px)"
                        size="small"
                        value={exportHeight}
                        onChange={(e) =>
                            setExportHeight(parsePositiveInt(e.target.value))
                        }
                    />
                    <TextField
                        type="number"
                        label="動画の長さ(秒)"
                        size="small"
                        value={durationSec}
                        onChange={(e) =>
                            setDurationSec(parsePositiveInt(e.target.value))
                        }
                    />
                </Stack>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                >
                    <Button
                        onClick={onDownloadPng}
                        startIcon={<DownloadIcon />}
                        variant="contained"
                        disabled={!sizeIsValid}
                    >
                        PNGダウンロード
                    </Button>
                    <Button
                        onClick={onDownloadMp4}
                        startIcon={
                            isRecording ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : (
                                <VideocamIcon />
                            )
                        }
                        variant="contained"
                        disabled={!canExportVideo}
                    >
                        {isRecording
                            ? `MP4生成中... ${Math.round(progress * 100)}%`
                            : 'MP4ダウンロード'}
                    </Button>
                </Stack>
                {exportError !== null && (
                    <Typography color="error" variant="body2">
                        {exportError}
                    </Typography>
                )}
            </Stack>
        </div>
    )
}
