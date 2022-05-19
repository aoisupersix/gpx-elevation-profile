import React from 'react'

import SettingsIcon from '@mui/icons-material/Settings'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    TextField,
} from '@mui/material'

import { defaultSetting, ProfileSetting } from '../models/profile-setting'
import { IconicTypography } from './IconicTypography'

interface ProfileSettingProps {
    setting?: ProfileSetting
    onUpdate?: (setting: ProfileSetting) => void
}

export const ProfileSettingForm: React.FC<ProfileSettingProps> = (props) => {
    const setting = props.setting ?? defaultSetting
    const [distanceUnit, setDistanceUnit] = React.useState<number>(
        setting.distanceUnit,
    )

    const onUpdate = () => {
        const newSetting = {
            ...setting,
            distanceUnit: distanceUnit,
        }

        props.onUpdate(newSetting)
    }

    return (
        <Card variant="outlined">
            <CardHeader
                variant="outlined"
                title={
                    <IconicTypography
                        icon={<SettingsIcon color="primary" />}
                        text="算出設定"
                        variant="h5"
                    />
                }
            />
            <CardContent>
                <Grid container spacing={3}>
                    <Grid item>
                        <TextField
                            type="number"
                            variant="standard"
                            label="斜度算出単位"
                            value={distanceUnit}
                            onChange={(e) =>
                                setDistanceUnit(Number.parseInt(e.target.value))
                            }
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" onClick={onUpdate}>
                            設定更新
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}
