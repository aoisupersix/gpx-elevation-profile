import * as React from 'react'

import { Button, ButtonGroup } from '@mui/material'
import { Track } from 'gpxparser'
import styled from 'styled-components'

import { readFileAsGpx } from '../models/gpx-reader'

interface GpxUploaderProps {
    fileName?: string
    onUpload: (gpx: Track, file: File) => void
}

const HiddenInput = styled.input`
    display: none;
`

export const GpxUploader: React.FC<GpxUploaderProps> = (props) => {
    const inputRef = React.useRef(null)

    const onClickUploadButton = () => {
        inputRef.current.click()
    }
    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        const file = (e.target as HTMLInputElement).files[0]
        readFileAsGpx(file).then((track) => {
            props.onUpload(track, file)
        })
    }

    return (
        <div>
            <ButtonGroup variant="contained" aria-label="primary button group">
                <Button disabled>
                    {props.fileName ?? 'ファイルをアップロードしてください。'}
                </Button>
                <Button onClick={onClickUploadButton}>GPXをアップロード</Button>
            </ButtonGroup>
            <HiddenInput
                type="file"
                accept=".gpx"
                onChange={onChange}
                ref={inputRef}
            />
        </div>
    )
}
