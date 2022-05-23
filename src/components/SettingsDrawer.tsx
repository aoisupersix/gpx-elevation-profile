import React from 'react'

import CloseIcon from '@mui/icons-material/Close'
import UpgradeIcon from '@mui/icons-material/Upgrade'
import {
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    Stack,
    TextField,
    Typography,
} from '@mui/material'
import styled from 'styled-components'

import { ElevationColor } from '../models/elevation-color'
import { defaultSetting, ProfileSetting } from '../models/profile-setting'
import { ColorPicker } from './ColorPicker'
import { ElevationColorList } from './ElevationColorList'

interface SettingsDrawerProps {
    open?: boolean
    setting?: ProfileSetting
    onUpdate?: (setting: ProfileSetting) => void
    onClose?: () => void
}

const MarginedPicker = styled(ColorPicker)`
    background: #fff;
    margin: 0 10px;
`

export const SettingsDrawer: React.FC<SettingsDrawerProps> = (props) => {
    const [setting, setSetting] = React.useState<ProfileSetting>(
        props.setting ?? defaultSetting,
    )

    const close = () => {
        if (props.onClose !== undefined) {
            props.onClose()
        }
    }

    const onChangeElevationColor = (item: ElevationColor, idx: number) => {
        const newColors = setting.elevationColors.map((v, i) =>
            i === idx ? item : v,
        )
        setSetting({ ...setting, elevationColors: newColors })
    }

    const onAddElevationColor = () => {
        const newColor: ElevationColor = {
            min: 0,
            max: 5,
            color: { r: 255, g: 255, b: 255, a: 1 },
        }
        setSetting({
            ...setting,
            elevationColors: [...setting.elevationColors, newColor],
        })
    }

    const onDeleteElevationColor = (idx: number) => {
        const colors = setting.elevationColors.filter((_, i) => i !== idx)
        setSetting({
            ...setting,
            elevationColors: colors,
        })
    }

    const onUpdate = () => {
        if (props.onUpdate !== undefined) {
            props.onUpdate(setting)
        }
    }

    return (
        <Drawer
            open={props.open}
            anchor="right"
            onClose={close}
            PaperProps={{ square: false, sx: { borderRadius: 3 } }}
        >
            <Box
                width={500}
                display="flex"
                flexDirection="column"
                height="100%"
            >
                <Box
                    padding={2}
                    justifyContent="space-between"
                    alignItems="center"
                    display="flex"
                >
                    <Typography>設定</Typography>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={props.onClose}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider />
                <Box
                    minHeight={0}
                    display="flex"
                    flexDirection="column"
                    height="100%"
                >
                    <Stack
                        divider={<Divider />}
                        spacing={1}
                        direction="column"
                        flex={1}
                        px={2}
                        sx={{ overflowY: 'auto' }}
                    >
                        <Box>
                            <Typography
                                variant="subtitle2"
                                marginY={2}
                                gutterBottom
                            >
                                斜度算出単位
                            </Typography>
                            <TextField
                                type="number"
                                variant="outlined"
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
                        </Box>
                        <Box>
                            <Typography
                                variant="subtitle2"
                                marginY={2}
                                gutterBottom
                            >
                                斜度プロファイル背景色
                            </Typography>
                            <MarginedPicker
                                color={setting.profileBgColor}
                                onChange={(c) =>
                                    setSetting({
                                        ...setting,
                                        profileBgColor: c.rgb,
                                    })
                                }
                            />
                        </Box>
                        <Box>
                            <Typography
                                variant="subtitle2"
                                marginY={2}
                                gutterBottom
                            >
                                斜度ごとの色分け
                            </Typography>
                            <ElevationColorList
                                items={setting.elevationColors}
                                onChange={onChangeElevationColor}
                                onAdd={onAddElevationColor}
                                onDelete={onDeleteElevationColor}
                            />
                        </Box>
                    </Stack>
                    <Box m={1}>
                        <Button
                            variant="contained"
                            onClick={onUpdate}
                            startIcon={<UpgradeIcon />}
                            fullWidth
                        >
                            更新
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    )
}
