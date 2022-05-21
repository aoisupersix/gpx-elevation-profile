import * as React from 'react'

import { Grid, Typography } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { Track } from 'gpxparser'

import { DistancePoint } from '../models/distance-point'
import { convertPoints } from '../models/point-converter'
import { defaultSetting, ProfileSetting } from '../models/profile-setting'
import { ElevationViewer } from './ElevationViewer'
import { Footer } from './Footer'
import { GpxUploader } from './GpxUploader'
import { ProfileSettingForm } from './ProfileSettingForm'
import { Spacer } from './Spacer'

const useGpx = () => {
    const [setting, setSetting] = React.useState<ProfileSetting>(defaultSetting)
    const [file, setFile] = React.useState<File | undefined>()
    const [track, setTrack] = React.useState<Track | undefined>()
    const [distancePoints, setDistancePoints] = React.useState<DistancePoint[]>(
        [],
    )

    React.useEffect(() => {
        if (track === undefined) {
            setDistancePoints([])
        } else {
            const convertedPoints = convertPoints(
                track.points,
                setting.distanceUnit,
            )
            setDistancePoints(convertedPoints)
        }
    }, [track, setting])

    return {
        setting,
        setSetting,
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
    const {
        setting,
        setSetting,
        file,
        setFile,
        track,
        setTrack,
        distancePoints,
    } = useGpx()

    const onGpxUpload = (track: Track, file: File) => {
        setTrack(track)
        setFile(file)
    }

    return (
        <div className="app">
            <ThemeProvider theme={theme}>
                <Typography
                    variant="h3"
                    sx={{ fontWeight: 'bold' }}
                    gutterBottom
                >
                    gpx-elevation-profile
                </Typography>
                <Typography gutterBottom>
                    GPXファイルから斜度を取得して、平均勾配ごとに色分けしたグラフを生成します。
                    <br />
                    処理は全てクライアントサイドで完結するため、GPXファイルがサーバにアップロードされることはありません。
                </Typography>
                <Grid
                    container
                    spacing={3}
                    alignItems="center"
                    justifyContent="center"
                >
                    <Grid item xs={12}>
                        <ProfileSettingForm
                            setting={setting}
                            onUpdate={setSetting}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <GpxUploader
                            fileName={file?.name}
                            onUpload={onGpxUpload}
                        />
                    </Grid>
                </Grid>

                <Spacer size={50} axis="vertical" />
                {distancePoints.length > 0 && (
                    <ElevationViewer
                        name={`${track.name}(${file.name})`}
                        track={track}
                        points={distancePoints}
                        setting={setting}
                    />
                )}
                <Footer />
            </ThemeProvider>
        </div>
    )
}

export default App
