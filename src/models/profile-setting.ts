import { RGBColor } from 'react-color'

/**
 * Settings of elevation profile.
 */
export interface ProfileSetting {
    /**
     * Unit for calculating slope.
     */
    distanceUnit: number

    /**
     * Background color of levation profile.
     */
    profileBgColor: RGBColor
}

/**
 * Default settings of elevation profile.
 */
export const defaultSetting: ProfileSetting = {
    distanceUnit: 100,
    profileBgColor: { r: 255, g: 255, b: 255, a: 1 },
}
