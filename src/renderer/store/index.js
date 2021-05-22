import fs from 'fs'
import path from 'path'
import https from 'https'
import { execFile } from 'child_process'
import unzipper from 'unzipper'
import sha256File from 'sha256-file'

export const state = () => ({
  loaded: {
    tiles: false,
    plugins: false,
    settings: false
  },
  gameDialog: null,
  showJoinDialog: false,
  showSettings: false,
  showGameHistory: true,
  showGameTiles: false,
  showGameSetup: false,
  java: null, // { version, outdated, error }
  engine: null,
  download: null,
  updateInfo: null,
  updateProgress: null,
  runningTests: false
})

export const mutations = {
  tilesLoaded (state) {
    state.loaded.tiles = true
  },

  pluginsLoaded (state) {
    state.loaded.plugins = true
  },

  settingsLoaded (state) {
    state.loaded.settings = true
  },

  gameDialog (state, gameDialog) {
    state.gameDialog = gameDialog
  },

  showJoinDialog (state, value) {
    state.showJoinDialog = value
  },

  showSettings (state, value) {
    state.showSettings = value
  },

  toggleGameHistory (state) {
    state.showGameHistory = !state.showGameHistory
  },

  showGameTiles (state, value) {
    state.showGameTiles = value
  },

  showGameSetup (state, value) {
    state.showGameSetup = value
  },

  java (state, value) {
    state.java = value
  },

  engine (state, value) {
    state.engine = value
  },

  download (state, value) {
    state.download = value
  },

  updateInfo (state, value) {
    state.updateInfo = value
  },

  updateProgress (state, value) {
    state.updateProgress = value
  },

  runningTests (state, value) {
    state.runningTests = value
  }
}

export const getters = {
  loaded: state => state.loaded.plugins && state.loaded.tiles
}

export const actions = {
  async loadPlugins ({ commit }) {
    const { $theme } = this._vm
    await $theme.loadPlugins()
    const classicArtwork = $theme.installedArtworks.find(({ id }) => id === 'classic')
    if (!classicArtwork || classicArtwork.outdated) {
      console.log('Downloading classic artwork.')
      const link = $theme.REMOTE_ARTWORKS.classic.url
      commit('download', { name: 'classic.zip', description: 'Downloading classic artwork', link })

      const userDataPath = window.process.argv.find(arg => arg.startsWith('--user-data=')).replace('--user-data=', '')
      const artworksFolder = path.join(userDataPath, 'artworks')
      await fs.promises.mkdir(artworksFolder, { recursive: true })
      const zipName = path.join(artworksFolder, 'classic.zip')
      try {
        if ((await fs.promises.stat(zipName)).isFile()) {
          await fs.promises.unlink(zipName)
        }
      } catch {
        // ignore
      }
      const file = fs.createWriteStream(zipName)
      await new Promise((resolve, reject) => {
        https.get(link, function (response) {
          response.pipe(file)
          file.on('finish', function () {
            file.close(resolve)
          })
        }).on('error', function (err) { // Handle errors
          fs.unlink(zipName) // Delete the file async. (But we don't check the result)
          reject(err.message)
        })
      })
      const checksum = sha256File(zipName)
      if (checksum !== $theme.REMOTE_ARTWORKS.classic.sha256) {
        console.log('classic.zip checksum mismatch ' + checksum)
        commit('download', { name: 'classic.zip', description: 'Error: Downloaded file has invalid checksum', link })
        await fs.promises.unlink(zipName)
      } else {
        console.log('classic.zip downloaded. sha256: ' + checksum)
        if (classicArtwork?.outdated) {
          console.log('Removing outdated artwork ' + classicArtwork.folder)
          await fs.promises.rmdir(classicArtwork.folder, { recursive: true })
        }
        await fs.createReadStream(zipName)
          .pipe(unzipper.Extract({ path: artworksFolder }))
          .promise()
        await fs.promises.unlink(zipName)
        await $theme.loadPlugins() // reload
        commit('download', null)
      }
    }
    commit('pluginsLoaded')
  },

  async checkJavaVersion ({ state, commit, rootState }, forceCheck = false) {
    if (state.java !== null && !forceCheck) {
      return state.java
    }

    return new Promise((resolve, reject) => {
      const executable = rootState.settings.javaPath || 'java'
      console.log(`Checking ${executable}`)
      execFile(executable, ['-version'], (error, stdout, stderr) => {
        console.log(stderr)
        if (error) {
          console.error(error)
          const value = { ok: false, error: 'not-found' }
          commit('java', value)
          reject(value)
        } else {
          const ident = stderr.split('\n')[0]
          let vendor = null
          let version = null

          let m = ident.match(/^(\w+) version "1\.(\d)\.[^"]*"/)
          if (m) {
            vendor = m[1]
            version = parseInt(m[2])
          } else {
            m = ident.match(/^(\w+) version "(\d+)/)
            if (m) {
              vendor = m[1]
              version = parseInt(m[2])
            }
          }

          const outdated = !!version && version < 11
          const value = {
            version,
            vendor,
            ok: !outdated,
            error: outdated ? 'outdated' : null
          }
          commit('java', value)
          resolve(value)
        }
      })
    })
  },

  async checkEngineVersion ({ state, commit, rootState }) {
    if (state.engine !== null) {
      return state.engine
    }
    return new Promise(async (resolve, reject) => {
      const { $engine } = this._vm
      const remote = $engine.isRemote()

      if (remote) {
        const value = {
          ok: true,
          path: `Remote engine on ${remote.host}:${remote.port}`,
          version: ''
        }
        commit('engine', value)
        resolve(value.version)
        return
      }

      const executable = rootState.settings.javaPath || 'java'
      const args = $engine.getJavaArgs()
      args[args.length - 1] = args[args.length - 1]
      const enginePath = args[args.length - 1]

      try {
        await fs.promises.access(enginePath, fs.constants.R_OK)
      } catch (e) {
        console.error(e)
        const value = {
          ok: false,
          path: enginePath,
          error: 'not-found'
        }
        commit('engine', value)
        reject(value)
        return
      }

      execFile(executable, [...args, '--version'], (error, stdout, stderr) => {
        if (error) {
          console.error(error)
          const value = {
            ok: false,
            path: enginePath,
            error: 'exec-error',
            errorMessage: '' + error
          }
          commit('engine', value)
          reject(value)
        } else {
          const version = stdout.trim()
          console.log('engine version ' + version)
          const value = {
            ok: true,
            path: enginePath,
            version
          }
          commit('engine', value)
          resolve(version)
        }
      })
    })
  }
}
