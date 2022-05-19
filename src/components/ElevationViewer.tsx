import * as React from 'react'

import 'react-json-pretty/themes/monikai.css'

import AnalyticsIcon from '@mui/icons-material/Analytics'
import BarChartIcon from '@mui/icons-material/BarChart'
import DataObjectIcon from '@mui/icons-material/DataObject'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Card,
    CardContent,
    CardHeader,
    Stack,
    Typography,
} from '@mui/material'
import { Track } from 'gpxparser'
import JSONPretty from 'react-json-pretty'

import { DistancePoint } from '../models/distance-point'
import { ProfileSetting } from '../models/profile-setting'
import { ElevationGraph } from './ElevationGraph'

interface ElevationViewerProps {
    name: string
    track: Track
    points: DistancePoint[]
    setting: ProfileSetting
}

export const ElevationViewer: React.FC<ElevationViewerProps> = (props) => {
    return (
        <Card variant="outlined">
            <CardHeader
                title={
                    <Stack direction="row" alignItems="center" gap={1}>
                        <AnalyticsIcon color="primary" />
                        <Typography variant="h5">{props.name}</Typography>
                    </Stack>
                }
            />
            <CardContent>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2-content"
                        id="panel2-header"
                    >
                        <Stack direction="row" alignItems="center" gap={1}>
                            <BarChartIcon color="primary" />
                            <Typography>斜度プロファイル</Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionSummary>
                        <ElevationGraph
                            points={props.points}
                            setting={props.setting}
                        />
                    </AccordionSummary>
                </Accordion>
                <Accordion TransitionProps={{ timeout: 300 }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                    >
                        <Stack direction="row" alignItems="center" gap={1}>
                            <DataObjectIcon color="primary" />
                            <Typography>
                                ポイント間の距離と勾配を算出したJSON
                            </Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <JSONPretty data={props.points} />
                    </AccordionDetails>
                </Accordion>
            </CardContent>
        </Card>
    )
}
