import * as React from 'react'

import DownloadIcon from '@mui/icons-material/Download'
import ImageIcon from '@mui/icons-material/Image'
import VideocamIcon from '@mui/icons-material/Videocam'
import {
    Box,
    Button,
    InputAdornment,
    LinearProgress,
    MenuItem,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material'
import { ChartConfiguration } from 'chart.js'

import { exportChartMp4, exportChartPng } from '../models/chart-export'

type ExportFormat = 'png' | 'mp4'

/** Selectable frame rates. 60fps is the default. */
const fpsPresets = [24, 30, 60] as const
const defaultFps = 60

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

interface ExportPanelProps {
    config: ChartConfiguration<'bar'>
}

/**
 * Export settings and download actions for the elevation chart.
 *
 * Holds all export-related state (including per-frame video progress) so that
 * updates during MP4 generation re-render only this panel, never the on-screen
 * chart above it.
 */
export const ExportPanel: React.FC<ExportPanelProps> = (props) => {
    const [format, setFormat] = React.useState<ExportFormat>('png')
    const [presetLabel, setPresetLabel] = React.useState(
        defaultResolution.label,
    )
    const [exportWidth, setExportWidth] = React.useState(
        defaultResolution.width,
    )
    const [exportHeight, setExportHeight] = React.useState(
        defaultResolution.height,
    )
    const [videoFps, setVideoFps] = React.useState<number>(defaultFps)
    const [animationSec, setAnimationSec] = React.useState(2)
    const [holdSec, setHoldSec] = React.useState(15)
    const [isRecording, setIsRecording] = React.useState(false)
    const [progressPercent, setProgressPercent] = React.useState(0)
    const [exportError, setExportError] = React.useState<string | null>(null)

    const isCustomResolution = presetLabel === customPresetLabel
    const sizeIsValid = exportWidth > 0 && exportHeight > 0
    const canExport =
        format === 'png'
            ? sizeIsValid
            : sizeIsValid && animationSec > 0 && holdSec >= 0 && !isRecording

    const onSelectPreset = (label: string) => {
        setPresetLabel(label)
        const preset = resolutionPresets.find((p) => p.label === label)
        if (preset !== undefined) {
            setExportWidth(preset.width)
            setExportHeight(preset.height)
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

    const onDownloadPng = () => {
        setExportError(null)
        try {
            exportChartPng(
                props.config,
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
        setProgressPercent(0)
        try {
            await exportChartMp4(props.config, {
                width: exportWidth,
                height: exportHeight,
                fps: videoFps,
                animationSec,
                holdSec,
                fileName: 'elevation-graph.mp4',
                onProgress: (ratio) =>
                    setProgressPercent(Math.round(ratio * 100)),
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

    const onDownload = format === 'png' ? onDownloadPng : onDownloadMp4

    const downloadLabel =
        format === 'png'
            ? 'PNGをダウンロード'
            : isRecording
              ? `MP4生成中... ${progressPercent}%`
              : 'MP4を生成してダウンロード'

    const secondsAdornment = <InputAdornment position="end">秒</InputAdornment>

    return (
        <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                エクスポート
            </Typography>

            <Box>
                <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                >
                    出力形式
                </Typography>
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    color="primary"
                    value={format}
                    onChange={(_, value: ExportFormat | null) => {
                        if (value !== null) {
                            setFormat(value)
                        }
                    }}
                    disabled={isRecording}
                >
                    <ToggleButton value="png">
                        <ImageIcon fontSize="small" sx={{ mr: 1 }} />
                        画像 (PNG)
                    </ToggleButton>
                    <ToggleButton value="mp4">
                        <VideocamIcon fontSize="small" sx={{ mr: 1 }} />
                        動画 (MP4)
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

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
                        disabled={isRecording}
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
                        disabled={!isCustomResolution || isRecording}
                    />
                    <TextField
                        type="number"
                        label="高さ(px)"
                        size="small"
                        value={exportHeight}
                        onChange={(e) => onChangeHeight(e.target.value)}
                        sx={{ width: 120 }}
                        disabled={!isCustomResolution || isRecording}
                    />
                </Stack>
            </Box>

            {format === 'mp4' && (
                <Box>
                    <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                    >
                        動画設定
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ flexWrap: 'wrap', gap: 2 }}
                    >
                        <TextField
                            select
                            label="フレームレート"
                            size="small"
                            value={videoFps}
                            onChange={(e) =>
                                setVideoFps(Number(e.target.value))
                            }
                            sx={{ width: 140 }}
                            disabled={isRecording}
                        >
                            {fpsPresets.map((fps) => (
                                <MenuItem key={fps} value={fps}>
                                    {fps}fps
                                </MenuItem>
                            ))}
                        </TextField>
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
                            disabled={isRecording}
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
                            disabled={isRecording}
                        />
                    </Stack>
                </Box>
            )}

            <Box>
                <Button
                    onClick={onDownload}
                    startIcon={<DownloadIcon />}
                    variant="contained"
                    disabled={!canExport}
                >
                    {downloadLabel}
                </Button>
            </Box>

            {isRecording && (
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center' }}
                >
                    <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={{ flexGrow: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                        {progressPercent}%
                    </Typography>
                </Stack>
            )}

            {exportError !== null && (
                <Typography color="error" variant="body2">
                    {exportError}
                </Typography>
            )}
        </Stack>
    )
}
