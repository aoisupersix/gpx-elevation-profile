import { Point } from 'gpxparser'

import { calcDistance } from './distance-calculator'
import { DistancePoint } from './distance-point'
import { calcAverageSlope } from './slope-calculator'
import { ceilToMultiple } from './util'

/**
 * Converts a GPX points to a distance points.
 * @param points GPX points.
 * @param unitDist Distance as a unit of calculation of distance point.
 * @returns Converted distance points.
 */
export const convertPoints = (
    points: Point[],
    unitDist = 100,
): DistancePoint[] => {
    if (points.length < 1) {
        throw new Error('No or less than one point exists in the GPX file.')
    }
    const convertedPoints: DistancePoint[] = []

    let prevPoint = points[0]
    let segmentBoundary = unitDist
    let segmentHDist = 0
    let totalDist = 0
    let segmentVInitialDist = points[0].ele
    for (let i = 0; i < points.length; i++) {
        const point = points[i]
        const dist = calcDistance(prevPoint, point)
        segmentHDist += dist
        totalDist += dist
        if (totalDist > segmentBoundary || i == points.length - 1) {
            const segmentVDist = point.ele - segmentVInitialDist
            const convertedPoint: DistancePoint = {
                segmentHorizontalDistance: segmentHDist,
                segmentVerticalDistance: segmentVDist,
                totalDistance: totalDist,
                elevation: point.ele,
                averageSlope: calcAverageSlope(segmentHDist, segmentVDist),
            }
            convertedPoints.push(convertedPoint)

            segmentBoundary = ceilToMultiple(totalDist, unitDist)
            segmentHDist = 0
            segmentVInitialDist = point.ele
        }

        prevPoint = point
    }

    return convertedPoints
}
