import GpxParser, { Track } from 'gpxparser'

/**
 * Reads gpx track of the specified file using the FileReader API.
 * @param blob Files to be read.
 * @returns readed gpx track or error.
 */
export const readFileAsGpx = async (blob: Blob): Promise<Track> => {
    const gpxText = await readFileAsText(blob)
    const gpx = new GpxParser()
    gpx.parse(gpxText)

    return gpx.tracks[0]
}

/**
 * Reads text of the specified file using the FileReader API.
 * @param blob Files to be read.
 * @returns readed file or error event.
 */
const readFileAsText = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
            resolve(ev.target.result as string)
        }
        reader.onerror = (ev) => {
            reject(ev)
        }
        reader.readAsText(blob)
    })
}
