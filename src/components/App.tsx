import { Point } from 'gpxparser'
import * as React from 'react'
import { DistancePoint } from '../models/distance-point'
import { convertPoints } from '../models/point-converter'
import './../assets/scss/App.scss'
import { GpxUploader } from './GpxUploader'

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

const App = () => {
    const { setGpxPoints } = usePoints()

    return (
        <div className="app">
            <h1>gpx-elevation-profile</h1>
            <GpxUploader setGpxPoints={setGpxPoints} />
        </div>
    )
}

export default App
