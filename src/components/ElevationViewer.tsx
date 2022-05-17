import * as React from 'react'
import 'react-json-pretty/themes/monikai.css'
import JSONPretty from 'react-json-pretty'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Card,
    CardContent,
    Typography,
} from '@mui/material'
import { Bar } from 'react-chartjs-2'
import { DistancePoint } from '../models/distance-point'
import { ElevationGraph } from './ElevationGraph'

interface ElevationViewerProps {
    points: DistancePoint[]
}

export const ElevationViewer: React.FC<ElevationViewerProps> = (props) => {
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h3">Result</Typography>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2-content"
                        id="panel2-header"
                    >
                        <Typography>斜度プロファイル</Typography>
                    </AccordionSummary>
                    <AccordionSummary>
                        <ElevationGraph points={props.points} />
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
