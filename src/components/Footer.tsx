import React from 'react'

import GitHubIcon from '@mui/icons-material/GitHub'
import TwitterIcon from '@mui/icons-material/Twitter'
import { Link, Stack } from '@mui/material'

export const Footer: React.FC<Record<string, never>> = ({}) => {
    return (
        <Stack direction="row" gap={3} justifyContent="center">
            <Link
                href="https://github.com/aoisupersix/gpx-elevation-profile"
                variant="caption"
            >
                <GitHubIcon fontSize="inherit" />
                Source(Github)
            </Link>
            <Link href="https://twitter.com/aoisupersix" variant="caption">
                <TwitterIcon fontSize="inherit" />
                Twitter
            </Link>
        </Stack>
    )
}
