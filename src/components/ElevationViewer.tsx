import * as React from 'react'

import 'react-json-pretty/themes/monikai.css'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Card,
    CardContent,
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
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Result: {props.name}
                </Typography>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2-content"
                        id="panel2-header"
                    >
                        <Typography>斜度プロファイル</Typography>
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
                        <Typography>
                            ポイント間の距離と勾配を算出したJSON
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <JSONPretty data={props.points} />
                    </AccordionDetails>
                </Accordion>
            </CardContent>
        </Card>
    )
}
