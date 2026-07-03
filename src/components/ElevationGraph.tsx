import * as React from 'react'

import DownloadIcon from '@mui/icons-material/Download'
import VideocamIcon from '@mui/icons-material/Videocam'
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    InputAdornment,
    MenuItem,
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

interface ResolutionPreset {
    label: string
    width: number
    height: number
}

/**
 * Selectable output resolutions. The WQHD preset is the default; "カスタム"
 * lets the user enter an arbitrary width/height.
 */
const resolutionPresets: ResolutionPreset[] = [
    { label: 'WQHD (2560×1440)', width: 2560, height: 1440 },
    { label: 'フルHD (1920×1080)', width: 1920, height: 1080 },
    { label: '4K UHD (3840×2160)', width: 3840, height: 2160 },
    { label: 'HD (1280×720)', width: 1280, height: 720 },
]

const customPresetLabel = 'カスタム'
const defaultResolution = resolutionPresets[0]

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
            tooltip: {
                callbacks: {
                    title: (items) => {
                        const point = props.points[items[0].dataIndex]
                        return `合計距離:${roundByDigits(
                            point.totalDistance,
                            1,
                        )}m 標高:${roundByDigits(
                            point.elevation,
                            1,
                        )}m 平均勾配:${roundByDigits(point.averageSlope, 1)}%`
                    },
                    label: () => '',
                },
            },
        },
        scales: {
            x: {
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
            y: {
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

    const labels = props.points.map((p) => p.totalDistance)
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
                y: {
                    ...barOptions.scales?.y,
                    max: ceilToMultiple(maxElevation + 100, 100),
                },
            },
        },
        plugins: barPlugins,
    }

    const [presetLabel, setPresetLabel] = React.useState(
        defaultResolution.label,
    )
    const [exportWidth, setExportWidth] = React.useState(
        defaultResolution.width,
    )
    const [exportHeight, setExportHeight] = React.useState(
        defaultResolution.height,
    )
    const [animationSec, setAnimationSec] = React.useState(2)
    const [holdSec, setHoldSec] = React.useState(15)
    const [isRecording, setIsRecording] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const [exportError, setExportError] = React.useState<string | null>(null)

    const isCustomResolution = presetLabel === customPresetLabel
    const sizeIsValid = exportWidth > 0 && exportHeight > 0
    const canExportVideo =
        sizeIsValid && animationSec > 0 && holdSec >= 0 && !isRecording

    const onSelectPreset = (label: string) => {
        setPresetLabel(label)
        const preset = resolutionPresets.find((p) => p.label === label)
        if (preset !== undefined) {
            setExportWidth(preset.width)
            setExportHeight(preset.height)
        }
    }

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
                animationSec,
                holdSec,
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

    const parseNonNegativeNumber = (value: string): number => {
        const parsed = Number.parseFloat(value)
        return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed
    }

    const onChangeWidth = (value: string) => {
        setPresetLabel(customPresetLabel)
        setExportWidth(parsePositiveInt(value))
    }

    const onChangeHeight = (value: string) => {
        setPresetLabel(customPresetLabel)
        setExportHeight(parsePositiveInt(value))
    }

    const secondsAdornment = <InputAdornment position="end">秒</InputAdornment>

    return (
        <Stack spacing={3}>
            <ChartCanvas className="chart-container">
                <Bar
                    redraw
                    data={barData}
                    options={barOptions}
                    plugins={barPlugins}
                />
            </ChartCanvas>

            <Divider />

            <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    画像・動画のエクスポート
                </Typography>

                <Box>
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                    >
                        解像度
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ flexWrap: 'wrap', gap: 2 }}
                    >
                        <TextField
                            select
                            label="プリセット"
                            size="small"
                            value={presetLabel}
                            onChange={(e) => onSelectPreset(e.target.value)}
                            sx={{ minWidth: 200 }}
                        >
                            {resolutionPresets.map((p) => (
                                <MenuItem key={p.label} value={p.label}>
                                    {p.label}
                                </MenuItem>
                            ))}
                            <MenuItem value={customPresetLabel}>
                                {customPresetLabel}
                            </MenuItem>
                        </TextField>
                        <TextField
                            type="number"
                            label="幅(px)"
                            size="small"
                            value={exportWidth}
                            onChange={(e) => onChangeWidth(e.target.value)}
                            sx={{ width: 120 }}
                            disabled={!isCustomResolution}
                        />
                        <TextField
                            type="number"
                            label="高さ(px)"
                            size="small"
                            value={exportHeight}
                            onChange={(e) => onChangeHeight(e.target.value)}
                            sx={{ width: 120 }}
                            disabled={!isCustomResolution}
                        />
                    </Stack>
                </Box>

                <Box>
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                    >
                        動画の時間
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ flexWrap: 'wrap', gap: 2 }}
                    >
                        <TextField
                            type="number"
                            label="アニメーション時間"
                            size="small"
                            value={animationSec}
                            onChange={(e) =>
                                setAnimationSec(
                                    parseNonNegativeNumber(e.target.value),
                                )
                            }
                            slotProps={{
                                input: { endAdornment: secondsAdornment },
                            }}
                            helperText="バーが伸びる時間"
                            sx={{ width: 180 }}
                        />
                        <TextField
                            type="number"
                            label="完了後の待機時間"
                            size="small"
                            value={holdSec}
                            onChange={(e) =>
                                setHoldSec(
                                    parseNonNegativeNumber(e.target.value),
                                )
                            }
                            slotProps={{
                                input: { endAdornment: secondsAdornment },
                            }}
                            helperText="完成後に静止表示する時間"
                            sx={{ width: 180 }}
                        />
                    </Stack>
                </Box>

                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 2 }}
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
        </Stack>
    )
}
