import * as React from 'react'

import { Button } from '@mui/material'
import { Point } from 'gpxparser'
import styled from 'styled-components'

import { readFileAsGpx } from '../models/gpx-reader'

interface GpxUploaderProps {
    name: string
    setGpxPoints: React.Dispatch<React.SetStateAction<Point[]>>
}

const Input = styled.input`
    display: none;
`

export const GpxUploader: React.FC<GpxUploaderProps> = (props) => {
    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        const file = (e.target as HTMLInputElement).files[0]
        readFileAsGpx(file).then((track) => {
            props.setGpxPoints(track.points)
        })
    }

    return (
        <label htmlFor={`upload-button-${props.name}`}>
            <Input
                id={`upload-button-${props.name}`}
                type="file"
                accept=".gpx"
                onChange={onChange}
            />
            <Button variant="contained" component="span">
                GPXをアップロード
            </Button>
        </label>
    )
}
