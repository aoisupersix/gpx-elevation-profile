import * as React from 'react'
import { readFileAsGpx } from '../models/gpx-reader'

const useUploadedGpx = () => {
    const [isUploaded, setIsUploaded] = React.useState<boolean>(false)
    const onChange = (e: React.FormEvent<HTMLInputElement>) => {
        setIsUploaded(!isUploaded)

        const file = (e.target as HTMLInputElement).files[0]
        readFileAsGpx(file).then((track) => {
            console.log(track)
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
