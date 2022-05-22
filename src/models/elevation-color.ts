import { RGBColor } from 'react-color'

/**
 * Showing color for each average elevation.
 */
export interface ElevationColor {
    /**
     * Min average elevation.
     */
    min: number

    /**
     * Max average elevation.
     */
    max: number

    /**
     * Color of this elevation
     */
    color: RGBColor
}
