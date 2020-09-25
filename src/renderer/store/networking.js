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
  startServer ({ commit, dispatch }, setup) {
    const { $server, $connection } = this._vm
    $server.start(setup)
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
        dispatch('game/handleStart', payload, { root: true })
      } else if (type === 'GAME') {
        // not used now
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
