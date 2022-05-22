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

export const getElevationColor = (
    colors: ElevationColor[],
    slope: number,
): ElevationColor | undefined => {
    const includedColors = colors.filter(
        (c) => slope >= c.min && slope <= c.max,
    )

    if (includedColors.length === 1) {
        return includedColors[0]
    }
    if (includedColors.length > 1) {
        // always give preference to the property with the larger max.
        return includedColors.sort((a, b) => (a.max > b.max ? 1 : -1))[0]
    }

    return undefined
}
