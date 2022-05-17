/**
 * Rounds a number to the multiple specified in the argument.
 * Fractions are rounded up.
 * @param num Number to be rounded.
 * @param unit Rounding target multiple.
 * @returns Rounded value.
 */
export const ceilToMultiple = (num: number, unit: number) => {
    return Math.ceil(num / unit) * unit
}

/**
 * Round to the specified number of digits.
 * @param num Number to be rounded.
 * @param digits Number of decimal places tobe rounded off.
 * @returns Rounded value.
 */
export const roundByDigits = (num: number, digits: number) => {
    return parseFloat(num.toFixed(digits))
}

/**
 * Split the array into chunks.
 * @param array Array to be chunked.
 * @param size Size to chunk.
 * @returns Chunked array
 */
export const chunk = <T>(array: Array<T>, size: number): Array<Array<T>> => {
    return array.reduce(
        (arr, _, idx) =>
            idx % size ? arr : [...arr, array.slice(idx, idx + size)],
        [],
    )
}
