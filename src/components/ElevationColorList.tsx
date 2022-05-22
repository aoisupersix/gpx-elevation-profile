import * as React from 'react'

import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import {
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
} from '@mui/material'
import { ColorResult } from 'react-color'
import styled from 'styled-components'

import { ElevationColor } from '../models/elevation-color'
import { ColorPicker } from './ColorPicker'
import { ElevationSlider } from './ElevationSlider'

interface ElevationColorListProps {
    items: ElevationColor[]
    onChange?: (item: ElevationColor, idx: number) => void
    onAdded?: () => void
}

const CenterColorPicker = styled(ColorPicker)`
    display: flex;
    justify-content: center;
    align-items: center;
`

export const ElevationColorList: React.FC<ElevationColorListProps> = (
    props,
) => {
    const onChangeSlider = (min: number, max: number, idx: number) => {
        if (props.onChange !== undefined) {
            const item = props.items[idx]
            props.onChange({ ...item, min: min, max: max }, idx)
        }
    }

    const onChangeColor = (color: ColorResult, idx: number) => {
        if (props.onChange !== undefined) {
            const item = props.items[idx]
            props.onChange({ ...item, color: color.rgb }, idx)
        }
    }

    const onAdded = () => {
        if (props.onAdded !== undefined) {
            props.onAdded()
        }
    }

    const listItems = props.items.map((ec, idx) => (
        <ListItem
            key={idx}
            secondaryAction={
                <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                </IconButton>
            }
        >
            <ListItemText>
                <Stack direction="row" gap={3}>
                    <ElevationSlider
                        minValue={ec.min}
                        maxValue={ec.max}
                        onChange={(min, max) => onChangeSlider(min, max, idx)}
                    />
                    <CenterColorPicker
                        color={ec.color}
                        onChange={(c) => onChangeColor(c, idx)}
                    />
                </Stack>
            </ListItemText>
        </ListItem>
    ))

    return (
        <Stack direction="column">
            <Paper>
                <List>{listItems}</List>
            </Paper>
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onAdded}
            >
                追加
            </Button>
        </Stack>
    )
}
