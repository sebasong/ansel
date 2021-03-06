import React from 'react'
import { render } from 'react-dom'

import App from './components/App'
import { init as initBackgroundClient } from './BackgroundClient'
import { init as initForegroundService } from './ForegroundService'
import { checkSettingsExist } from './controller/SettingsController'

import './entry.css'
import './less/index.less'

const pkgs = require('../../package.json')


if (process.env.ANSEL_DEV_MODE) {
    document.title = 'Ansel - DEV MODE'
} else {
    document.title = `Ansel - ${pkgs.version}`
}

if (process.env.ANSEL_TEST_MODE) {
    document.title = 'Ansel - TEST MODE'
}

initBackgroundClient()
initForegroundService()
checkSettingsExist()

render(React.createElement(App), document.getElementById('app'))
