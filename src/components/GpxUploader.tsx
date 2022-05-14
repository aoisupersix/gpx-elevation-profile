import * as React from 'react'
import { readFileAsGpx } from '../models/gpx-reader'
import { convertPoint } from '../models/point-converter'

const useUploadedGpx = () => {
    const [isUploaded, setIsUploaded] = React.useState<boolean>(false)
    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        setIsUploaded(!isUploaded)

        const file = (e.target as HTMLInputElement).files[0]
        readFileAsGpx(file).then((track) => {
            const convertedPoints = convertPoint(track.points)
            console.log(convertedPoints)
        })
    }

    return {
        isUploaded,
        onChange,
    }
}

export const GpxUploader: React.FC<Record<string, never>> = ({}) => {
    const { onChange } = useUploadedGpx()

    return <input type="file" accept=".gpx" onChange={onChange} />
}
