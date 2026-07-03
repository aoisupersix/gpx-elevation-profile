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
} from '@mui/material'
import { Track } from 'gpxparser'
import JSONPretty from 'react-json-pretty'

import { ElevationGraph } from './ElevationGraph'
import { IconicTypography } from './IconicTypography'
import { DistancePoint } from '../models/distance-point'
import { ProfileSetting } from '../models/profile-setting'

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
                    <IconicTypography
                        icon={<AnalyticsIcon color="primary" />}
                        text={props.name}
                        variant="h5"
                    />
                }
            />
            <CardContent>
                <Accordion defaultExpanded>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2-content"
                        id="panel2-header"
                    >
                        <IconicTypography
                            icon={<BarChartIcon color="primary" />}
                            text="斜度プロファイル"
                        />
                    </AccordionSummary>
                    <AccordionDetails>
                        <ElevationGraph
                            points={props.points}
                            setting={props.setting}
                        />
                    </AccordionDetails>
                </Accordion>
                <Accordion slotProps={{ transition: { timeout: 300 } }}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                    >
                        <IconicTypography
                            icon={<DataObjectIcon color="primary" />}
                            text="ポイント間の距離と勾配を算出したJSON"
                        />
                    </AccordionSummary>
                    <AccordionDetails>
                        <JSONPretty data={props.points} />
                    </AccordionDetails>
                </Accordion>
            </CardContent>
        </Card>
    )
}
