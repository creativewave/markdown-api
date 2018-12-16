
/**
 * getDateToNumber :: Date -> Number
 *
 * It transforms a date to a number with the YYYYMMDD format.
 */
const getDateToNumber = date => {

    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()

    return Number(`${year}${10 > month ? `0${month}` : month}${10 > day ? `0${day}` : day}`)
}

module.exports = getDateToNumber
