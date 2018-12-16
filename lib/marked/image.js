
const compose = require('lodash/fp/compose')
const fromPairs = require('lodash/fp/fromPairs')
const map = require('../lambda/map')
const split = require('lodash/fp/split')
const slugify = require('../slugify')
const defaultRenderer = require('./default')

const IMAGE_SIZES = [
    { suffix: '-small', width: 640 },
    { suffix: '-medium', width: 1080 },
    { suffix: '-large', width: 1440 },
    { suffix: '', width: 1920 },
]

/**
 * getImageSrcSet :: String -> Number -> String
 */
const getImageSrcSet = (src, maxWidth) =>
    IMAGE_SIZES
        .reduce((sizes, { suffix, width }) =>
            width > maxWidth
                ? sizes
                : sizes.concat(src.replace(/.jpg$/, `${suffix}.jpg ${width}w`)), [])
        .join(', ')

/**
 * renderImage :: String -> String -> String -> String -> String
 */
const renderImage = staticUrlsPath => (href, title, text) => {

    const isOutboundLink = /^http/.test(href)

    if (isOutboundLink) {
        return defaultRenderer('image', href, title, text)
    }

    const src = href.replace('static', staticUrlsPath)
    const id = slugify(src)

    let img

    if (/.jpg$/.test(href)) {
        const { width, height } = compose(fromPairs, map(split('=')), split(','))(title)
        const srcSet = getImageSrcSet(src, width)
        img = `<img src="${src}" srcset="${srcSet}" width="${width}" height="${height}" alt="${text}">`
    } else {
        img = `<img src="${src}" alt="${text}">`
    }

    return `
        <a id="close-${id}" href="#open-${id}" title="Agrandir l'image">${img}</a>
        <a id="open-${id}" href="#close-${id}" title="Fermer l'image">
            ${img}
        </a>
    `
}

module.exports = renderImage
