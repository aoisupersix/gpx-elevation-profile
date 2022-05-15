import { Point } from 'gpxparser'
import JSONPretty from 'react-json-pretty'
import 'react-json-pretty/themes/monikai.css'
import * as React from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Card,
    CardContent,
    Typography,
} from '@mui/material'

import { DistancePoint } from '../models/distance-point'
import { convertPoints } from '../models/point-converter'
import { GpxUploader } from './GpxUploader'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Spacer } from './Spacer'

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
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h3">Result</Typography>
                            <Accordion TransitionProps={{ timeout: 300 }}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography>
                                        ポイント間の距離と勾配を算出したJSON
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <JSONPretty data={distancePoints} />
                                </AccordionDetails>
                            </Accordion>
                        </CardContent>
                    </Card>
                )}
            </ThemeProvider>
        </div>
    )
}

export default App
