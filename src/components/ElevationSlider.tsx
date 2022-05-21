import * as React from 'react'

import { Mark } from '@mui/base'
import { Box, Slider, Typography } from '@mui/material'

export const ElevationSlider: React.FC<Record<string, never>> = () => {
    const [value, setValue] = React.useState<number[]>([0, 5])

    const marks: Mark[] = [
        { value: 0, label: '0%' },
        { value: 10, label: '10%' },
        { value: 20, label: '20%' },
        { value: 50, label: '50%' },
    ]

    const handleChange = (e: Event, newValue: number | number[]) => {
        setValue(newValue as number[])
    }

    return (
        <Box minWidth={400}>
            <Typography variant="caption">斜度(%):</Typography>
            <Slider
                min={0}
                max={50}
                getAriaLabel={() => 'Temperature range'}
                step={5}
                marks={marks}
                value={value}
                onChange={handleChange}
                valueLabelDisplay="auto"
                getAriaValueText={(v) => `${v}%`}
            />
        </Box>
    )
}
