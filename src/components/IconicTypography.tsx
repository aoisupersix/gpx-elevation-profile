import React from 'react'

import { Stack, Typography } from '@mui/material'
import { Variant } from '@mui/material/styles/createTypography'

interface IconicTypographyProps {
    icon: React.ReactNode
    text: string
    variant?: Variant
    gap?: number
}

export const IconicTypography: React.FC<IconicTypographyProps> = (props) => {
    return (
        <Stack direction="row" alignItems="center" gap={props.gap ?? 1}>
            {props.icon}
            <Typography variant={props.variant}>{props.text}</Typography>
        </Stack>
    )
}
