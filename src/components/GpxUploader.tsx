import * as React from 'react'

import UploadFileIcon from '@mui/icons-material/UploadFile'
import {
    Button,
    ButtonGroup,
    Card,
    CardContent,
    CardHeader,
} from '@mui/material'
import { Track } from 'gpxparser'
import styled from 'styled-components'

import { readFileAsGpx } from '../models/gpx-reader'
import { IconicTypography } from './IconicTypography'

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
        <Card variant="outlined">
            <CardHeader
                variant="outlined"
                title={
                    <IconicTypography
                        icon={<UploadFileIcon color="primary" />}
                        text="GPXファイル選択"
                        variant="h5"
                    />
                }
            />
            <CardContent>
                <ButtonGroup
                    variant="contained"
                    aria-label="primary button group"
                >
                    <Button disabled>
                        {props.fileName ??
                            'ファイルをアップロードしてください。'}
                    </Button>
                    <Button onClick={onClickUploadButton}>
                        GPXをアップロード
                    </Button>
                </ButtonGroup>
                <HiddenInput
                    type="file"
                    accept=".gpx"
                    onChange={onChange}
                    ref={inputRef}
                />
            </CardContent>
        </Card>
    )
}
