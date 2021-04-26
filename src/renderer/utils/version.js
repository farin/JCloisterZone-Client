export function getAppVersion () {
  if (process.env.NODE_ENV === 'development') {
    return process.env.npm_package_version
  }
  return window.process.argv.find(arg => arg.startsWith('--app-version=')).replace('--app-version=', '')
}
