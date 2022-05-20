import * as React from 'react'

import { Button } from '@mui/material'
import {
    ChartData,
    Chart,
    ChartOptions,
    Color,
    registerables,
    Plugin,
} from 'chart.js'
import 'react-json-pretty/themes/monikai.css'
import { Bar } from 'react-chartjs-2'
import styled from 'styled-components'

import { DistancePoint } from '../models/distance-point'
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

Chart.register(...registerables)

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
        const slope = Math.abs(p.averageSlope)
        if (slope >= 20) {
            return 'black'
        } else if (slope >= 15) {
            return 'gray'
        } else if (slope >= 10) {
            return 'red'
        } else if (slope >= 5) {
            return 'yellow'
        }
        return 'lime'
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

    const chartRef = React.useRef(null)
    const onClick = () => {
        const image = chartRef.current.toBase64Image()
        const a = document.createElement('a')
        a.download = 'elevation-graph.png'
        a.href = image
        a.click()
    }

    return (
        <div>
            <ChartCanvas className="chart-container">
                <Bar
                    redraw
                    data={barData}
                    options={barOptions}
                    ref={chartRef}
                    plugins={barPlugins}
                />
            </ChartCanvas>
            <Button onClick={onClick}>PNGダウンロード</Button>
        </div>
    )
}
