import { Point } from 'gpxparser'
import * as React from 'react'
import { readFileAsGpx } from '../models/gpx-reader'

interface GpxUploaderProps {
    setGpxPoints: React.Dispatch<React.SetStateAction<Point[]>>
}

export const GpxUploader: React.FC<GpxUploaderProps> = (props) => {
    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        const file = (e.target as HTMLInputElement).files[0]
        readFileAsGpx(file).then((track) => {
            props.setGpxPoints(track.points)
        })
    }

    return <input type="file" accept=".gpx" onChange={onChange} />
}
