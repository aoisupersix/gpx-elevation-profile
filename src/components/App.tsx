import * as React from 'react'

import { Typography } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Track } from 'gpxparser'

import { DistancePoint } from '../models/distance-point'
import { convertPoints } from '../models/point-converter'
import { ElevationViewer } from './ElevationViewer'
import { GpxUploader } from './GpxUploader'
import { Spacer } from './Spacer'

const useGpx = () => {
    const [file, setFile] = React.useState<File | undefined>()
    const [track, setTrack] = React.useState<Track | undefined>()
    const [distancePoints, setDistancePoints] = React.useState<DistancePoint[]>(
        [],
    )

    React.useEffect(() => {
        if (track === undefined) {
            setDistancePoints([])
        } else {
            const convertedPoints = convertPoints(track.points)
            setDistancePoints(convertedPoints)
        }
    }, [track])

    return {
        file,
        setFile,
        track,
        setTrack,
        distancePoints,
    }
}

const theme = createTheme({
    typography: {
        fontFamily: [
            'Roboto',
            '"Noto Sans JP"',
            '"Helvetica"',
            'Arial',
            'sans-serif',
        ].join(','),
    },
})

const App = () => {
    const { file, setFile, track, setTrack, distancePoints } = useGpx()

    const onGpxUpload = (track: Track, file: File) => {
        setTrack(track)
        setFile(file)
    }

    return (
        <div className="app">
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Typography variant="h3">gpx-elevation-profile</Typography>
                <Typography variant="subtitle1">
                    GPXファイルから斜度のプロファイルを生成します。
                </Typography>
                <hr />
                <GpxUploader onUpload={onGpxUpload} name="gpxuploader" />
                <Spacer size={50} axis="vertical" />
                {distancePoints.length > 0 && (
                    <ElevationViewer
                        name={`${track.name}(${file.name})`}
                        track={track}
                        points={distancePoints}
                    />
                )}
            </ThemeProvider>
        </div>
    )
}

export default App
