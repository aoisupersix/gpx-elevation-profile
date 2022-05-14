/**
 * The point including distance and elevation difference calculated from GPX points.
 */
export interface DistancePoint {
    /**
     * Horizontal Distance(m) from one previous point.
     */
    segmentHorizontalDistance: number

    /**
     * Vertical distance(m).
     */
    segmentVerticalDistance: number

    /**
     * Total distance(m) from initial point.
     */
    totalDistance: number

    /**
     * Elevation of the point.
     */
    elevation: number

    /**
     * Average slope(%) from one previous point.
     */
    averageSlope: number
}
