import path from 'path'
import BrowserWinHandler from './BrowserWinHandler'
const isDev = process.env.NODE_ENV === 'development'

const INDEX_PATH = path.join(__dirname, '..', 'renderer', 'index.html')
const DEV_SERVER_URL = process.env.DEV_SERVER_URL // eslint-disable-line prefer-destructuring

const winHandler = new BrowserWinHandler({
  height: 600,
  width: 1000,
  icon: path.join(__dirname, '..', 'resources', 'icon.ico'),
  webPreferences: {
    zoomFactor: 1
  }
})

winHandler.onCreated(browserWindow => {
  if (isDev) {
    browserWindow.loadURL(DEV_SERVER_URL)
  } else {
    browserWindow.loadFile(INDEX_PATH)
  }

  browserWindow.maximize()

  // const contents = browserWindow.webContents
  // contents.on('did-finish-load', () => {
  //   contents.setZoomFactor(1)
  //   contents.setVisualZoomLevelLimits(1, 1)
  //   contents.setLayoutZoomLevelLimits(0, 0)
  // })
})

export default winHandler
