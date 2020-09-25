import { ENGINE_MESSAGES } from '@/constants/messages'

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
    commit('game/clear', null, { root: true })
    const { $server, $connection } = this._vm    
    await $server.start(game)
    $connection.connect()
    $connection.on('message', message => {
      const { type, payload} = message
      if (ENGINE_MESSAGES.has(type)) {
        dispatch('game/handleEngineMessage', message, { root: true })
      } else if (type === 'WELCOME') {
        commit('sessionId', payload.sessionId) 
        $server.setOwner(payload.sessionId)
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
    })    
  },

  close () {
    const { $server, $connection } = this._vm
    $connection.disconnect()
    $server.stop()
  }
}
