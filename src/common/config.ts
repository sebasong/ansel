import fs from 'fs'
import os from 'os'

let dotAnsel = `${process.env.HOME}/.ansel`
let migrationsFolder = `${process.resourcesPath}/app/migrations`
let anselFolder = `${process.resourcesPath}/app`
const cwd = process.cwd()

if (process.env.ANSEL_DEV_MODE) {
    dotAnsel = `${cwd}/dot-ansel`
    migrationsFolder = `${cwd}/migrations`
    anselFolder = `${cwd}`
}

if (process.env.ANSEL_TEST_MODE) {
    const testsPath = '/tmp/ansel-tests'

    if (!fs.existsSync(testsPath))
        fs.mkdirSync(testsPath)

    dotAnsel = `${testsPath}/dot-ansel`
    migrationsFolder = `${cwd}/migrations`
}

const menusFolder = `${anselFolder}/menus`
const platform = os.platform()

export default {
    platform,
    characters: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZéè',
    acceptedRawFormats: [ 'raf', 'cr2', 'arw', 'dng' ],
    acceptedImgFormats: [ 'png', 'jpg', 'jpeg', 'tif', 'tiff', 'webp' ],
    watchedFormats: /([$#\w\d]+)-([$#\w\dèé]+)-(\d+)\.(JPEG|JPG|PNG|PPM|TIFF|WEBP)/i,
    exportFormats: [ 'jpg', 'png', 'webp' ],
    workExt: 'webp',
    dotAnsel,
    menusFolder,
    keymapsFolder: `${anselFolder}/keymaps`,
    menuPath: `${menusFolder}/${platform}.json`,
    dbFile: `${dotAnsel}/db.sqlite3`,
    settings: `${dotAnsel}/settings.json`,
    nonRawPath: `${dotAnsel}/non-raw`,
    thumbnailPath: `${dotAnsel}/thumbnails`,
    tmp: '/tmp/ansel',
    concurrency: 3,

    knex: {
        client: 'sqlite3',
        useNullAsDefault: true,
        connection: {
            filename: `${dotAnsel}/db.sqlite3`
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: migrationsFolder
        }
    },

    editors: [
        {
            name: 'Gimp',
            cmd: 'gimp',
            format: 'JPG',
            platforms: [ 'darwin', 'linux' ]
        },
        {
            name: 'Rawtherapee',
            cmd: 'rawtherapee',
            format: 'RAW',
            platforms: [ 'darwin', 'linux' ]
        },
        {
            name: 'Darktable',
            cmd: 'darktable',
            format: 'RAW',
            platforms: [ 'darwin', 'linux' ]
        }
    ]
}
