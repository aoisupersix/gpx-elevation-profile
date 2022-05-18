import * as React from 'react'

import { ChartData, Chart, ChartOptions, Color, registerables } from 'chart.js'
import 'react-json-pretty/themes/monikai.css'
import { Bar } from 'react-chartjs-2'
import styled from 'styled-components'

import { DistancePoint } from '../models/distance-point'
import { ceilToMultiple, chunk, roundByDigits } from '../models/util'

interface ElevationViewerProps {
    points: DistancePoint[]
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
                },
            },
            yAxis: {
                title: {
                    display: true,
                    text: '標高(m)',
                },
                grid: {
                    z: 1,
                },
                min: Math.max(0, ceilToMultiple(minElevation - 100, 100)),
            },
        },
    }

    const labels = props.points.map((p) => p.totalDistance)
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
                label: 'Dataset',
                backgroundColor: colors,
                barPercentage: 1,
                categoryPercentage: 1,
                data: elevations,
            },
        ],
    }

    return (
        <ChartCanvas className="chart-container">
            <Bar data={barData} options={barOptions} />
        </ChartCanvas>
    )
}
