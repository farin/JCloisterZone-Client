import fs from 'fs'
import path from 'path'
import Vue from 'vue'

import { remote } from 'electron'

export const state = () => ({
  // theme: 'light',
  // artworks: ['classic'], //active artworks
  lastGameSetup: null,
  recentSaves: []
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
  }

}

export const actions = {
  async load ({ commit }) {
    const settingsFile = path.join(remote.app.getPath('userData'), 'jcz-config.json')
    try {
      await fs.promises.access(settingsFile, fs.constants.R_OK)
      const settings = JSON.parse(await fs.promises.readFile(settingsFile))
      commit('settings', settings)
      console.log(this._vm)
      console.log(`Settings file ${settingsFile} was loaded.`)
    } catch (e) {
      // do nothong, settings doesnt exist
      console.log(`Settings file ${settingsFile} is not created.`)
    }
    commit('settingsLoaded', true, { root: true })
  },

  async save ({ state }) {
    const settingsFile = path.join(remote.app.getPath('userData'), 'jcz-config.json')
    try {
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
    recentSaves.splice(14, 1)
    commit('recentSaves', recentSaves)
    dispatch('save')
  },

  async clearRecentSaved({ commit, dispatch}) {
    commit('recentSaves', [])
    dispatch('save')
  }
}
