import { ENGINE_MESSAGES } from '@/constants/messages'
import { reject } from 'lodash'

export const state = () => ({
  sessionId: null
})

export const mutations = {
  sessionId (state, sessionId) {
    state.sessionId = sessionId
  },
}

export const actions = {
  async startServer ({ commit, dispatch }, game) {
    const { $server } = this._vm
    commit('game/clear', null, { root: true })
    await $server.start(game)
    await dispatch('connect', 'localhost')
  },

  async connect ({ commit, dispatch, rootState }, host) {
    const { $connection } = this._vm
    if (!host.match(/:\d+$/)) {
      host = `${host}:${rootState.settings.port}`
    }
    return new Promise((resolve, reject) => {
      const onMessage = message => {
        const { type, payload} = message
        if (ENGINE_MESSAGES.has(type)) {
          dispatch('game/handleEngineMessage', message, { root: true })
        } else if (type === 'WELCOME') {
          commit('sessionId', payload.sessionId)
          resolve()
        } else if (type === 'SLOT') {
          dispatch('gameSetup/handleSlotMessage', payload, { root: true })
        } else if (type === 'START') {
          dispatch('game/handleStartMessage', payload, { root: true })
        } else if (type === 'GAME') {
          dispatch('game/handleGameMessage', payload, { root: true })
        } else {
          console.error(payload)
          console.error(`Unhandled message ${type}`)
        }
      }
      $connection.connect(host, onMessage).catch(err => reject(err))
    })
  },

  close () {
    const { $server, $connection } = this._vm
    $connection.disconnect()
    $server.stop()
  }
}
