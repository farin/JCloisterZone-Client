import fs from 'fs'
import Vue from 'vue'
import isEqual from 'lodash/isEqual'
import { ipcRenderer } from 'electron'

import username from 'username'
import { randomId } from '@/utils/random'
import { CONSOLE_SETTINGS_COLOR } from '@/constants/logging'

const RECENT_SAVED_GAME_COUNT = 14
const RECENT_SETUP_FILE_COUNT = 9

/* eslint quote-props: 0 */
export const state = () => ({
  file: null,
  userAddons: [],
  enabledArtworks: ['classic/classic'],
  lastGameSetup: null,
  mySetups: [],
  // deprecated
  recentSaves: [],
  recentSetupSaves: [],
  recentJoinedGames: [],
  // ---
  showValidRulesOnly: false,
  clientId: null,
  secret: null,
  port: 37447,
  nickname: null,
  preferredColor: null,
  'confirm.always': true,
  'confirm.field': true,
  'confirm.tower': true,
  beep: true,
  activePlayerIndicatorBgColor: true,
  activePlayerIndicatorTriangle: true,
  playerListRotate: 'none', // none | active-on-top | local-on-top
  theme: 'light',
  enginePath: null, // explicit engine path
  javaPath: null, // exolicit java path
  playOnlineUrl: 'play.jcloisterzone.com/ws',
  devMode: process.env.NODE_ENV === 'development'
})

const changeCallbacks = {}

export const mutations = {
  settings (state, { settings, source }) {
    const changed = []
    Object.keys(settings).forEach(key => {
      if (JSON.stringify(state[key]) !== JSON.stringify(settings[key])) {
        changed.push(key)
      }
      Vue.set(state, key, settings[key])
    })

    changed.forEach(key => {
      const cb = changeCallbacks[key]
      if (cb) cb(settings[key], source)
    })
  },

  clientId (state, value) {
    state.clientId = value
  },

  recentJoinedGames (state, value) {
    state.recentJoinedGames = value
  },

  recentSaves (state, value) {
    state.recentSaves = value
  },

  recentSetupSaves (state, value) {
    state.recentSetupSaves = value
  },

  mySetups (state, value) {
    state.mySetups = value
  }
}

export const getters = {
  isMySetup: state => setup => {
    const bareSetup = { ...setup }
    delete bareSetup.options
    return !!state.mySetups.find(s => isEqual(s.setup, bareSetup))
  }
}

export const actions = {
  registerChangeCallback (ctx, [key, cb]) {
    changeCallbacks[key] = cb
  },

  async loaded ({ commit, dispatch }, { settings, file }) {
    let missingKey = false
    if (settings) {
      settings = { ...settings, file }
      if (!settings.clientId) {
        missingKey = true
        settings.clientId = randomId()
      }
      if (!settings.secret) {
        missingKey = true
        settings.secret = randomId()
      }
      if (!settings.nickname) {
        missingKey = true
        settings.nickname = await username()
      }
      // migrate legacy play online settings
      if (settings.playOnlineUrl === null || settings.playOnlineUrl === 'play.jcloisterzone.com/ws') {
        missingKey = true
        settings.playOnlineUrl = 'play-online.jcloisterzone.com/ws'
      }
      // migrate 5.6
      if (settings.enabledArtworks.length > 0 && settings.enabledArtworks[0] === 'classic') {
        missingKey = true
        settings.enabledArtworks = ['classic/classic']
      }
      commit('settings', { settings, source: 'load' })
      console.log(`%c settings %c loaded ${file}`, CONSOLE_SETTINGS_COLOR, '')
    } else {
      missingKey = true
      commit('settings', {
        settings: {
          file,
          clientId: randomId(),
          secret: randomId(),
          nickname: await username()
        },
        source: 'load'
      })
      console.log(`%c settings %c file ${file} doesn't exist. Creating default one.`, CONSOLE_SETTINGS_COLOR, '')
    }
    if (missingKey) {
      dispatch('save')
    }
    await dispatch('validateRecentSaves')
    commit('settingsLoaded', true, { root: true })
  },

  async save ({ state }) {
    try {
      const data = { ...state }
      delete data.file
      if (data.devMode !== process.env.NODE_ENV === 'development') {
        delete data.devMode
      }
      data.clientId = data.clientId.split('--')[0] // for dev mode, do not store changed id
      await ipcRenderer.invoke('settings.save', data)
      console.log(`%c settings %c saved to ${state.file}`, CONSOLE_SETTINGS_COLOR, '')
    } catch (e) {
      console.error(e)
      // do nothong, settings doesnt exist
    }
  },

  async addRecentSave ({ state, commit, dispatch }, { file, setup }) {
    const bareSetup = { ...setup }
    delete bareSetup.options
    const recentSaves = state.recentSaves.filter(f => f !== file) // if file is contained, it will be only reordered to begining
    recentSaves.unshift(file)
    recentSaves.splice(RECENT_SAVED_GAME_COUNT, recentSaves.length)
    commit('recentSaves', recentSaves)
    dispatch('save')
  },

  async addRecentSetupSave ({ state, commit, dispatch }, { file, setup }) {
    const bareSetup = { ...setup }
    delete bareSetup.options
    const recentSaves = state.recentSetupSaves.filter(f => f !== file) // if file is contained, it will be only reordered to begining
    recentSaves.unshift(file)
    recentSaves.splice(RECENT_SETUP_FILE_COUNT, recentSaves.length)
    commit('recentSetupSaves', recentSaves)
    dispatch('save')
  },

  async clearRecentSaves ({ commit, dispatch }) {
    commit('recentSaves', [])
    dispatch('save')
  },

  async clearRecentSetupSaves ({ commit, dispatch }) {
    commit('recentSetupSaves', [])
    dispatch('save')
  },

  async addRecentJoinedGame ({ commit, dispatch }, host) {
    commit('recentJoinedGames', [host])
    dispatch('save')
  },

  async validateRecentSaves ({ state, commit }) {
    const invalid = {}
    let containsInvalid = false
    for (const f of state.recentSaves) {
      try {
        await fs.promises.access(f, fs.constants.R_OK)
      } catch (e) {
        invalid[f] = true
        containsInvalid = true
      }
    }
    if (containsInvalid) {
      commit('recentSaves', state.recentSaves.filter(f => !invalid[f]))
    }
  },

  async validateRecentSetupSaves ({ state, commit }) {
    const invalid = {}
    let containsInvalid = false
    for (const f of state.recentSetupSaves) {
      try {
        await fs.promises.access(f, fs.constants.R_OK)
      } catch (e) {
        invalid[f] = true
        containsInvalid = true
      }
    }
    if (containsInvalid) {
      commit('recentSetupSaves', state.recentSetupSaves.filter(f => !invalid[f]))
    }
  },

  async addMySetup ({ state, commit, dispatch }, setup) {
    const { $tiles } = this._vm
    const bareSetup = { ...setup }
    delete bareSetup.options
    if (state.mySetups.find(s => isEqual(s, bareSetup))) return
    const mySetups = [...state.mySetups, {
      size: $tiles.getPackSize(setup.sets, setup.rules),
      setup: bareSetup
    }]
    commit('mySetups', mySetups)
    dispatch('save')
  },

  async removeMySetup ({ state, commit, dispatch }, setup) {
    const bareSetup = { ...setup }
    delete bareSetup.options
    const mySetups = state.mySetups.filter(s => !isEqual(s.setup, bareSetup))
    commit('mySetups', mySetups)
    dispatch('save')
  },

  async update ({ commit, dispatch }, settings) {
    commit('settings', { settings, source: 'update' })
    dispatch('save')
  }
}
