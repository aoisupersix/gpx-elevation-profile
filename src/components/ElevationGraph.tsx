import * as React from 'react'

import { Divider, Stack } from '@mui/material'
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

import { ExportPanel } from './ExportPanel'
import { DistancePoint } from '../models/distance-point'
import { getElevationColor } from '../models/elevation-color'
import { ProfileSetting } from '../models/profile-setting'
import { ceilToMultiple, chunk, roundByDigits } from '../models/util'

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

            <ExportPanel config={exportConfig} />
        </Stack>
    )
}
