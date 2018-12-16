
const copyDirectory = require('../fs/copyDirectory')
const imagemin = require('imagemin')
const imageminWebp = require('imagemin-webp')
const { join } = require('path')
const Task = require('folktale/concurrency/task')

/**
 * addWebp :: Path -> Task Error void
 */
const addWebp = dir =>
    Task.fromPromised(imagemin)([join(dir, '*.{jpg,png}')], dir, { use: [imageminWebp({ quality: 50 })] })

/**
 * addStaticDir :: Entry -> Task Error Entry
 *
 * It should copy `entry.srcStatic` files into `entry.distStatic`.
 * It should process `.jpg|png` from `entry.distStatic` into `.webp`.
 */
const addStaticDir = entry => copyDirectory(entry.srcStatic, entry.distStatic).chain(addWebp).map(() => entry)

module.exports = addStaticDir
