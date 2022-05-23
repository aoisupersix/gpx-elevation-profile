import * as React from 'react'

import { Mark } from '@mui/base'
import { Box, Slider, Typography } from '@mui/material'

interface ElevationSliderProps {
    minValue: number
    maxValue: number
    onChange?: (min: number, max: number) => void
}

export const ElevationSlider: React.FC<ElevationSliderProps> = (props) => {
    const marks: Mark[] = [
        { value: -50, label: '-50%' },
        { value: -20, label: '-20%' },
        { value: -10, label: '-10%' },
        { value: 0, label: '0%' },
        { value: 10, label: '10%' },
        { value: 20, label: '20%' },
        { value: 50, label: '50%' },
    ]

    const handleChange = (e: Event, newValue: number | number[]) => {
        if (props.onChange !== undefined) {
            const [min, max] = newValue as number[]
            props.onChange(min, max)
        }
    }

    return (
        <Box minWidth={300}>
            <Typography variant="caption">
                斜度(%):{props.minValue}~{props.maxValue}%
            </Typography>
            <Slider
                size="small"
                min={-50}
                max={50}
                getAriaLabel={() => '斜度範囲'}
                step={1}
                marks={marks}
                value={[props.minValue, props.maxValue]}
                onChange={handleChange}
                valueLabelDisplay="auto"
                valueLabelFormat={(x) => `${x}%`}
                getAriaValueText={(v) => `${v}%`}
            />
        </Box>
    )
}
