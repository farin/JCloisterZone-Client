import fs from 'fs'
import path from 'path'
import https from 'https'
import { execFile } from 'child_process'
import unzipper from 'unzipper'
import { remote } from 'electron'

export const state = () => ({
  loaded: {
    tiles: false,
    plugins: false,
    settings: false
  },
  gameDialog: null,
  showJoinDialog: false,
  showSettings: false,
  java: null,  // { version, outdated, error }
  engine: null,
  download: null
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

  java (state, value) {
    state.java = value
  },

  engine (state, value) {
    state.engine = value
  },

  download (state, value) {
    state.download = value
  }
}

export const getters = {
  loaded: state => state.loaded.plugins && state.loaded.tiles,
}

export const actions = {
  async loadPlugins ({ commit }) {
    const { $theme } = this._vm
    await $theme.loadPlugins()
    if (!$theme.installedArtworks.find(({ id }) => id === 'classic')) {
      console.log("Classic artwork does not exist. Downloading")
      const link = 'https://jcloisterzone.com/artworks/classic.zip'
      commit('download', { name: 'classic.zip', description: 'Downloading classic artwork', link })
      const artworksFolder = path.join(remote.app.getPath('userData'), 'artworks')
      await fs.promises.mkdir(artworksFolder, { recursive: true })
      const zipName = path.join(artworksFolder, 'classic.zip')
      const file = fs.createWriteStream(zipName);
      await new Promise((resolve, reject) => {
        https.get(link, function(response) {
          response.pipe(file);
          file.on('finish', function() {
            file.close(resolve);
          });
        }).on('error', function(err) { // Handle errors
          fs.unlink(dest); // Delete the file async. (But we don't check the result)
          if (cb) reject(err.message);
        });
      })
      console.log('classic.zip downloaded')
      await fs.createReadStream(zipName)
        .pipe(unzipper.Extract({ path: artworksFolder }))
        .promise()
      await fs.promises.unlink(zipName)
      await $theme.loadPlugins() // reload
      commit('download', null)
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
          error: 'not-found',
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
            errorMessage: "" + error
          }
          commit('engine', value)
          reject(value)
        } else {
          const version = stdout.trim()
          console.log("engine version " + version)
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
