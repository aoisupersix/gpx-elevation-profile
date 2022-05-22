import React from 'react'

import SettingsIcon from '@mui/icons-material/Settings'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Grid,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import styled from 'styled-components'

import { ElevationColor } from '../models/elevation-color'
import { defaultSetting, ProfileSetting } from '../models/profile-setting'
import { ColorPicker } from './ColorPicker'
import { ElevationColorList } from './ElevationColorList'
import { IconicTypography } from './IconicTypography'

interface ProfileSettingProps {
    setting?: ProfileSetting
    onUpdate?: (setting: ProfileSetting) => void
}

const MarginedPicker = styled(ColorPicker)`
    background: #fff;
    margin: 0 10px;
`

export const ProfileSettingForm: React.FC<ProfileSettingProps> = (props) => {
    const [setting, setSetting] = React.useState<ProfileSetting>(
        props.setting ?? defaultSetting,
    )

    const onChangeElevationColor = (item: ElevationColor, idx: number) => {
        const newColors = setting.elevationColors.map((v, i) =>
            i === idx ? item : v,
        )
        setSetting({ ...setting, elevationColors: newColors })
    }

    const onUpdate = () => {
        if (props.onUpdate !== undefined) {
            props.onUpdate(setting)
        }
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
                    <Grid item xs={12}>
                        <TextField
                            type="number"
                            variant="standard"
                            label="斜度算出単位"
                            value={setting.distanceUnit}
                            onChange={(e) =>
                                setSetting({
                                    ...setting,
                                    distanceUnit: Number.parseInt(
                                        e.target.value,
                                    ),
                                })
                            }
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Stack direction="row">
                            <Typography>斜度プロファイル背景色</Typography>
                            <MarginedPicker
                                color={setting.profileBgColor}
                                onChange={(c) =>
                                    setSetting({
                                        ...setting,
                                        profileBgColor: c.rgb,
                                    })
                                }
                            />
                        </Stack>
                    </Grid>
                    <Grid item>
                        <Stack direction="column">
                            <Typography gutterBottom>
                                斜度ごとの色分け
                            </Typography>
                            <ElevationColorList
                                items={setting.elevationColors}
                                onChange={onChangeElevationColor}
                            />
                        </Stack>
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
