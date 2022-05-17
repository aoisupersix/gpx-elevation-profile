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
import { DistancePoint } from '../models/distance-point'

interface ElevationViewerProps {
    points: DistancePoint[]
}

export const ElevationViewer: React.FC<ElevationViewerProps> = (props) => {
    return (
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
                        <JSONPretty data={props.points} />
                    </AccordionDetails>
                </Accordion>
            </CardContent>
        </Card>
    )
}
