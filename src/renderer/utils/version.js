import { remote } from 'electron'

export function getAppVersion () {
  return process.env.NODE_ENV === 'development' ? process.env.npm_package_version : remote.app.getVersion()
}
