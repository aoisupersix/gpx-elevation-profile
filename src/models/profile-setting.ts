import { RGBColor } from 'react-color'

import { ElevationColor } from './elevation-color'

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

    /**
     * Colors for each average elevation.
     */
    elevationColors: ElevationColor[]
}

/**
 * Default settings of elevation profile.
 */
export const defaultSetting: ProfileSetting = {
    distanceUnit: 50,
    profileBgColor: { r: 255, g: 255, b: 255, a: 1 },
    elevationColors: [
        { min: -50, max: -20, color: { r: 0, g: 0, b: 0, a: 1 } },
        { min: -20, max: -15, color: { r: 128, g: 0, b: 0, a: 1 } },
        { min: -15, max: -10, color: { r: 255, g: 0, b: 0, a: 1 } },
        { min: -10, max: -5, color: { r: 255, g: 255, b: 0, a: 1 } },
        { min: -5, max: 0, color: { r: 0, g: 255, b: 0, a: 1 } },
        { min: 0, max: 5, color: { r: 0, g: 255, b: 0, a: 1 } },
        { min: 5, max: 10, color: { r: 255, g: 255, b: 0, a: 1 } },
        { min: 10, max: 15, color: { r: 255, g: 0, b: 0, a: 1 } },
        { min: 15, max: 20, color: { r: 128, g: 0, b: 0, a: 1 } },
        { min: 20, max: 50, color: { r: 0, g: 0, b: 0, a: 1 } },
    ],
}
