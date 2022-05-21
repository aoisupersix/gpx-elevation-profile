import * as React from 'react'

import DeleteIcon from '@mui/icons-material/Delete'
import {
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
} from '@mui/material'
import styled from 'styled-components'

import { ColorPicker } from './ColorPicker'
import { ElevationSlider } from './ElevationSlider'

const CenterColorPicker = styled(ColorPicker)`
    display: flex;
    justify-content: center;
    align-items: center;
`

export const ElevationColorList: React.FC<Record<string, never>> = () => {
    return (
        <Paper>
            <List>
                <ListItem
                    secondaryAction={
                        <IconButton edge="end" aria-label="delete">
                            <DeleteIcon />
                        </IconButton>
                    }
                >
                    <ListItemText>
                        <Stack direction="row" gap={3}>
                            <ElevationSlider />
                            <CenterColorPicker
                                color={{ r: 0, g: 0, b: 0, a: 1 }}
                            />
                        </Stack>
                    </ListItemText>
                </ListItem>
            </List>
        </Paper>
    )
}
