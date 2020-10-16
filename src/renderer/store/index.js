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
  java: null,
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

  showJoinDialog (state, showJoinDialog) {
    state.showJoinDialog = showJoinDialog
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
  javaMissing: state => state.java === false,
  javaOutdated: state => !!(state.java && state.java.version && state.java.version < 11),
  engineMissing: state => state.engine === false,
  engineReady: (state, getters) => !!(state.java && state.engine && !getters.javaOutdated)
}

export const actions = {
  async loadPlugins ({ commit }) {
    const { $theme } = this._vm
    const artworks = [
    	{ id: 'classic', link: 'https://jcloisterzone.com/artworks/classic.zip', file: 'classic.zip' },
    	{ id: 'fan_c1', link: 'http://localhost/JCloisterZone-Client/src/resources/artworks/fan_c1.zip', file: 'fan_c1.zip' },
    ]
    await $theme.loadPlugins()
    for (var i=0;i<artworks.length;i++) {
      var artwork = artworks[i];
      if (!$theme.installedArtworks.find(({ id }) => id === artwork.id)) {
        console.log(artwork.id+" artwork does not exist. Downloading")
        commit('download', { name: artwork.file, description: 'Downloading '+artwork.id+' artwork', link: artwork.link })
        const artworksFolder = path.join(remote.app.getPath('userData'), 'artworks')
        await fs.promises.mkdir(artworksFolder, { recursive: true })
        const zipName = path.join(artworksFolder, artwork.file)
        const file = fs.createWriteStream(zipName);
        await new Promise((resolve, reject) => {
          https.get(artwork.link, function(response) {
            response.pipe(file);
            file.on('finish', function() {
              file.close(resolve);
            });
          }).on('error', function(err) { // Handle errors
            console.log('Error download '+artwork.file);
          });
        })
        console.log(artwork.file+' downloaded')
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
      execFile(executable, ['--version'], (error, stdout, stderr) => {
        console.log(stdout)
        if (error) {
          commit('java', false)
          reject(error)
        } else {
          const ident = stdout.split('\n')[0]
          let version

          let m = ident.match(/^\w+ version "1\.(\d)\.[^"]*"/)
          if (m) {
            version = parseInt(m[1])
          } else {
            m = ident.match(/^\w+ (\d+)/)
            if (m) {
              version = parseInt(m[1])
            } else {
              version = null
            }
          }

          const value = {
            versionString: ident,
            version
          }
          commit('java', value)
          resolve(value)
        }
      })
    })
  },

  async checkEngineVersion ({ state, commit }) {
    if (state.engine !== null) {
      return state.engine
    }
    return new Promise((resolve, reject) => {
      const { $engine } = this._vm
      const args = $engine.getJavaArgs()
      execFile('java', [...args, '--version'], (error, stdout, stderr) => {
        if (error) {
          commit('engine', false)
          reject(error)
        } else {
          const version = stdout.trim()
          console.log("engine version " + version)
          const value = {
            path: args[args.length - 1],
            version
          }
          commit('engine', value)
          resolve(version)
        }
      })
    })
  }
}
