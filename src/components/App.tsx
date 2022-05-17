import { Point } from 'gpxparser'
import * as React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { Typography } from '@mui/material'

import { DistancePoint } from '../models/distance-point'
import { convertPoints } from '../models/point-converter'
import { GpxUploader } from './GpxUploader'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Spacer } from './Spacer'
import { ElevationViewer } from './ElevationViewer'

const usePoints = () => {
    const [gpxPoints, setGpxPoints] = React.useState<Point[]>([])
    const [distancePoints, setDistancePoints] = React.useState<DistancePoint[]>(
        [],
    )

    React.useEffect(() => {
        if (gpxPoints.length === 0) {
            setDistancePoints([])
        } else {
            const convertedPoints = convertPoints(gpxPoints)
            setDistancePoints(convertedPoints)
        }
    }, [gpxPoints])

    return {
        gpxPoints,
        setGpxPoints,
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
    const { setGpxPoints, distancePoints } = usePoints()

    return (
        <div className="app">
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Typography variant="h3">gpx-elevation-profile</Typography>
                <Typography variant="subtitle1">
                    GPXファイルから斜度のプロファイルを生成します。
                </Typography>
                <hr />
                <GpxUploader setGpxPoints={setGpxPoints} name="gpxuploader" />
                <Spacer size={50} axis="vertical" />
                {distancePoints.length > 0 && (
                    <ElevationViewer points={distancePoints} />
                )}
            </ThemeProvider>
        </div>
    )
}

export default App
