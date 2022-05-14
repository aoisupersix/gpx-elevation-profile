/**
 * Calculate the average slope.
 * @param horizontal Horizontal distance.
 * @param vertical Vertical distance.
 * @returns Calculated average slope.
 */
export const calcAverageSlope = (
    horizontal: number,
    vertical: number,
): number => {
    return (vertical * 100) / horizontal
}
