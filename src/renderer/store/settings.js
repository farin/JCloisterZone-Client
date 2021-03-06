import fs from 'fs'
import Vue from 'vue'
import isEqual from 'lodash/isEqual'
import { randomId } from '@/utils/random'
import { ipcRenderer } from 'electron'

import username from 'username'
import { CONSOLE_SETTINGS_COLOR } from '@/constants/logging'

const RECENT_GAMES_COUNT = 14
const RECENT_SETUPS_COUNT = 4

/* eslint quote-props: 0 */
export const state = () => ({
  file: null,
  userAddons: [],
  enabledArtworks: ['classic/classic'],
  lastGameSetup: null,
  recentSaves: [],
  recentSetupSaves: [],
  recentGameSetups: [],
  recentJoinedGames: [],
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
  'experimental.playOnline': false,
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

  recentGameSetups (state, value) {
    state.recentGameSetups = value
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
      // migrate old format
      if (settings.secret.includes('-')) {
        missingKey = true
        settings.secret = settings.secret.replaceAll('-', '')
      }
      if (!settings.nickname) {
        missingKey = true
        settings.nickname = await username()
      }
      // migrate legacy play online settings
      if (settings.playOnlineUrl === null) {
        missingKey = true
        settings.playOnlineUrl = 'play.jcloisterzone.com/ws'
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

  async addRecentSave ({ state, commit, dispatch }, file) {
    const recentSaves = state.recentSaves.filter(f => f !== file) // if file is contained, it will be only reordered to begining
    recentSaves.unshift(file)
    recentSaves.splice(RECENT_GAMES_COUNT, recentSaves.length)
    commit('recentSaves', recentSaves)
    dispatch('save')
  },

  async addRecentSetupSave ({ state, commit, dispatch }, file) {
    const recentSaves = state.recentSetupSaves.filter(f => f !== file) // if file is contained, it will be only reordered to begining
    recentSaves.unshift(file)
    recentSaves.splice(RECENT_GAMES_COUNT, recentSaves.length)
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

  async addRecentGameSetup ({ state, commit, dispatch }, setup) {
    const bareSetup = { ...setup }
    delete bareSetup.options
    const recentGameSetups = state.recentGameSetups.filter(s => !isEqual(s, bareSetup)) // if file is contained, it will be only reordered to begining
    recentGameSetups.unshift(bareSetup)
    recentGameSetups.splice(RECENT_SETUPS_COUNT, recentGameSetups.length)
    commit('recentGameSetups', recentGameSetups)
    dispatch('save')
  },

  async clearRecentGameSetups ({ commit, dispatch }) {
    commit('recentGameSetups', [])
    dispatch('save')
  },

  async update ({ commit, dispatch }, settings) {
    commit('settings', { settings, source: 'update' })
    dispatch('save')
  }
}
