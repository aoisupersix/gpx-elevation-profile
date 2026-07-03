import React from 'react'

import { Stack, Typography, TypographyProps } from '@mui/material'

interface IconicTypographyProps {
    icon: React.ReactNode
    text: string
    variant?: TypographyProps['variant']
    gap?: number
}

export const IconicTypography: React.FC<IconicTypographyProps> = (props) => {
    return (
        <Stack
            direction="row"
            sx={{ alignItems: 'center', gap: props.gap ?? 1 }}
        >
            {props.icon}
            <Typography variant={props.variant}>{props.text}</Typography>
        </Stack>
    )
}
