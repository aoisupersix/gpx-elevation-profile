/**
 * Calculate the distance between two points using the Hübeni formula.
 * @param a Point 1 to measure distance.
 * @param b Point 2 to measure distance.
 * @returns The calculated distance between two points.
 */
export const calcDistance = (a: Point, b: Point) => {
    const radALat = rad(a.lat)
    const radALon = rad(a.lon)
    const radBLat = rad(b.lat)
    const radBLon = rad(b.lon)
    const latDiff = radALat - radBLat
    const lonDiff = radALon - radBLon
    const latAvg = (radALat + radBLat) / 2.0

    const e2 =
        (Math.pow(equatorRadius, 2) - Math.pow(poleRadius, 2)) /
        Math.pow(equatorRadius, 2)
    const w = Math.sqrt(1 - e2 * Math.pow(Math.sin(latAvg), 2))
    const m = (equatorRadius * (1 - e2)) / Math.pow(w, 3)
    const n = equatorRadius / w
    const dist = Math.sqrt(
        Math.pow(m * latDiff, 2) + Math.pow(n * lonDiff * Math.cos(latAvg), 2),
    )

    return dist
}

/**
 * Point of latitude and longitude.
 */
interface Point {
    /**
     * Latitude.
     */
    lat: number

    /**
     * Longitude.
     */
    lon: number
}

/**
 * Converts angles from degrees to radians.
 * @param deg Angle to be convert (degree).
 * @returns Angle of radian.
 */
const rad = (deg: number) => {
    return (deg * Math.PI) / 180
}

/**
 * Polar radius.
 */
const poleRadius = 6356752.314245

/**
 * Equatorial radius.
 */
const equatorRadius = 6378137.0
