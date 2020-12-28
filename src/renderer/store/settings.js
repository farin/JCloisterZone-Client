import fs from 'fs'
import path from 'path'
import Vue from 'vue'
import isEqual from 'lodash/isEqual'
import { randomId } from '@/utils/random'

import username from 'username'
import { remote } from 'electron'
import { CONSOLE_SETTINGS_COLOR } from '@/constants/logging'

const RECENT_GAMES_COUNT = 14
const RECENT_SETUPS_COUNT = 4

/* eslint quote-props: 0 */
export const state = () => ({
  userArtworks: [],
  enabledArtworks: ['classic'],
  lastGameSetup: null,
  recentSaves: [],
  recentGameSetups: [],
  recentJoinedGames: [],
  clientId: null,
  secret: null,
  port: 37447,
  nickname: null,
  preferredColor: null,
  'confirm.always': true,
  'confirm.field': true,
  'confirm.tower': true,
  beep: true,
  theme: 'light',
  enginePath: null, // explicit engine path
  javaPath: null, // exolicit java path
  playOnlineUrl: 'play.jcloisterzone.com/ws',
  devMode: process.env.NODE_ENV === 'development'
})

const changeCallbacks = {}

let fileModifiedBySave = false
let watcher = null

export const mutations = {
  settings (state, settings) {
    const changed = []
    Object.keys(settings).forEach(key => {
      if (JSON.stringify(state[key]) !== JSON.stringify(settings[key])) {
        changed.push(key)
      }
      Vue.set(state, key, settings[key])
    })

    console.log('Changed settings: ' + changed)

    changed.forEach(key => {
      const cb = changeCallbacks[key]
      if (cb) cb(settings[key])
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

  recentGameSetups (state, value) {
    state.recentGameSetups = value
  }
}

export const getters = {
  settingsFile: state => {
    return path.join(remote.app.getPath('userData'), 'jcz-config.json')
  }
}

export const actions = {
  async watchSettingsFile ({ dispatch, getters }) {
    try {
      watcher = fs.watch(getters.settingsFile, eventType => {
        if (eventType === 'change' && !fileModifiedBySave) {
          dispatch('load')
        }
      })
    } catch (e) {
      console.error(e)
    }
  },

  async unwatchSettingsFile () {
    watcher?.close()
    watcher = null
  },

  registerChangeCallback (ctx, [key, cb]) {
    changeCallbacks[key] = cb
  },

  async load ({ commit, getters, dispatch }) {
    const settingsFile = getters.settingsFile
    let missingKey = false
    try {
      await fs.promises.access(settingsFile, fs.constants.R_OK)
      const settings = JSON.parse(await fs.promises.readFile(settingsFile))
      if (!settings.clientId) {
        missingKey = true
        settings.clientId = randomId()
      }
      // migrate old format
      if (settings.clientId.includes('-')) {
        missingKey = true
        settings.clientId = settings.clientId.replaceAll('-', '')
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
      commit('settings', settings)
      console.log(`%c settings %c loaded ${settingsFile}`, CONSOLE_SETTINGS_COLOR, '')
    } catch (e) {
      // do nothong, settings doesn't exist
      missingKey = true
      commit('settings', {
        clientId: randomId(),
        secret: randomId(),
        nickname: await username()
      })
      console.log(`%c settings %c file ${settingsFile} doesn't exist. Creating default one.`, CONSOLE_SETTINGS_COLOR, '')
    }
    if (missingKey) {
      dispatch('save')
    }
    await dispatch('validateRecentSaves')
    commit('settingsLoaded', true, { root: true })
  },

  async save ({ state, getters }) {
    const settingsFile = getters.settingsFile
    try {
      const data = { ...state }
      if (data.devMode !== process.env.NODE_ENV === 'development') {
        delete data.devMode
      }
      data.clientId = data.clientId.split('--')[0] // for dev mode, do not store changed id
      fileModifiedBySave = true
      await fs.promises.writeFile(settingsFile, JSON.stringify(data, null, 2))
      console.log(`%c settings %c writing ${settingsFile}`, CONSOLE_SETTINGS_COLOR, '')
      fileModifiedBySave = false
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

  async clearRecentSaves ({ commit, dispatch }) {
    commit('recentSaves', [])
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

  async addRecentGameSetup ({ state, commit, dispatch }, setup) {
    const recentGameSetups = state.recentGameSetups.filter(s => !isEqual(s, setup)) // if file is contained, it will be only reordered to begining
    recentGameSetups.unshift(setup)
    recentGameSetups.splice(RECENT_SETUPS_COUNT, recentGameSetups.length)
    commit('recentGameSetups', recentGameSetups)
    dispatch('save')
  },

  async clearRecentGameSetups ({ commit, dispatch }) {
    commit('recentGameSetups', [])
    dispatch('save')
  },

  async update ({ commit, dispatch }, settings) {
    commit('settings', settings)
    dispatch('save')
  }
}
