/**
 * Settings of elevation profile.
 */
export interface ProfileSetting {
    /**
     * Unit for calculating slope.
     */
    distanceUnit: number
}

/**
 * Default settings of elevation profile.
 */
export const defaultSetting: ProfileSetting = {
    distanceUnit: 100,
}
