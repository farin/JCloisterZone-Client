import fs from 'fs'
import { execFile } from 'child_process'

export const state = () => ({
  loaded: {
    settings: false,
    addons: false,
    tiles: false,
    artworks: false
  },
  hasClassicAddon: false,
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

  addonsLoaded (state) {
    state.loaded.addons = true
  },

  artworksLoaded (state) {
    state.loaded.artworks = true
  },

  settingsLoaded (state) {
    state.loaded.settings = true
  },

  hasClassicAddon (state, value) {
    state.hasClassicAddon = value
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

  downloadProgress (state, value) {
    if (state.download) {
      state.download.progress = value
    }
  },

  downloadSize (state, value) {
    if (state.download) {
      state.download.size = value
    }
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
  loaded: state => state.loaded.addons && state.loaded.tiles
}

export const actions = {

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
