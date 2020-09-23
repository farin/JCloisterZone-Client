import fs from 'fs'
import path from 'path'
import Vue from 'vue'
import isEqual from 'lodash/isEqual'
import { v4 as uuidv4 } from 'uuid';

import { remote } from 'electron'

const RECENT_GAMES_COUNT = 14
const RECENT_SETUPS_COUNT = 3

export const state = () => ({
  // theme: 'light',
  // artworks: ['classic'], //active artworks
  lastGameSetup: null,
  recentSaves: [],
  recentGameSetups: [],
  clientId: null,
  secret: null,
  devMode: process.env.NODE_ENV === 'development'
})


export const mutations = {
  settings (state, settings) {
    Object.keys(state).forEach(key => {
      if (settings[key] !== undefined) {
        Vue.set(state, key, settings[key])
      }
    })
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
  async load ({ commit, getters, dispatch }) {
    const settingsFile = getters.settingsFile
    let missingKey = false
    try {
      await fs.promises.access(settingsFile, fs.constants.R_OK)
      const settings = JSON.parse(await fs.promises.readFile(settingsFile))      
      if (!settings.clientId) {
        missingKey = true
        settings.clientId = uuidv4()
      }
      if (!settings.secret) {
        missingKey = true
        settings.secret = uuidv4()
      }
      commit('settings', settings)
      console.log(`Settings file ${settingsFile} was loaded.`)
    } catch (e) {
      // do nothong, settings doesn't exist
      missingKey = true
      commit('settings', { 
        clientId: uuidv4(),
        secret: uuidv4()
      })
      console.log(`Settings file ${settingsFile} doesn't exist. Creating default one.`)      
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
      if (data.devMode === false) {
        delete data.devMode
      }
      await fs.promises.writeFile(settingsFile, JSON.stringify(state, null, 2))
      console.log(`Writing to settings file ${settingsFile}`)
    } catch (e) {
      console.error(e)
      // do nothong, settings doesnt exist
    }
  },

  async addRecentSave({ state, commit, dispatch }, file) {
    const recentSaves = state.recentSaves.filter(f => f !== file) // if file is contained, it will be only reordered to begining
    recentSaves.unshift(file)
    recentSaves.splice(RECENT_GAMES_COUNT, recentSaves.length)
    commit('recentSaves', recentSaves)
    dispatch('save')
  },

  async clearRecentSaves({ commit, dispatch}) {
    commit('recentSaves', [])
    dispatch('save')
  },

  async validateRecentSaves({ state, commit }) {
    const invalid = {}
    let containsInvalid = false
    for (let f of state.recentSaves) {
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

  async addRecentGameSetup({ state, commit, dispatch }, setup) {
    const recentGameSetups = state.recentGameSetups.filter(s => !isEqual(s, setup)) // if file is contained, it will be only reordered to begining
    recentGameSetups.unshift(setup)
    recentGameSetups.splice(RECENT_SETUPS_COUNT, recentGameSetups.length)
    commit('recentGameSetups', recentGameSetups)
    dispatch('save')
  },

  async clearRecentGameSetups({ commit, dispatch}) {
    commit('recentGameSetups', [])
    dispatch('save')
  }
}
