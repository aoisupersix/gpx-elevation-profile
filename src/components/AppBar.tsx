import * as React from 'react'

import GitHubIcon from '@mui/icons-material/GitHub'
import SettingsIcon from '@mui/icons-material/Settings'
import ShareLocationIcon from '@mui/icons-material/ShareLocation'
import TwitterIcon from '@mui/icons-material/Twitter'
import {
    AppBar as MUIAppBar,
    IconButton,
    Toolbar,
    Typography,
} from '@mui/material'

export const AppBar: React.FC<Record<string, never>> = () => {
    return (
        <MUIAppBar position="static">
            <Toolbar>
                <IconButton
                    size="large"
                    color="inherit"
                    edge="start"
                    disableRipple
                    sx={{ cursor: 'default' }}
                >
                    <ShareLocationIcon />
                </IconButton>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: 'bold', flexGrow: 1 }}
                    gutterBottom
                >
                    gpx-elevation-profile
                </Typography>
                <IconButton size="large" color="inherit">
                    <SettingsIcon />
                </IconButton>
                <IconButton
                    size="large"
                    color="inherit"
                    href="https://github.com/aoisupersix/gpx-elevation-profile"
                    target="_blank"
                >
                    <GitHubIcon />
                </IconButton>
                <IconButton
                    size="large"
                    color="inherit"
                    href="https://twitter.com/aoisupersix"
                    target="_blank"
                >
                    <TwitterIcon />
                </IconButton>
            </Toolbar>
        </MUIAppBar>
    )
}
