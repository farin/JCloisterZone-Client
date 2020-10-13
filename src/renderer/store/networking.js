import { ENGINE_MESSAGES } from '@/constants/messages'

const STATUS_CONNECTING = 'connecting'
const STATUS_RECONNECTING = 'reconnecting'
const STATUS_CONNECTED = 'connected'

let reconnectTimeout = null;

export const state = () => ({
  sessionId: null,
  connectionStatus: null,
  reconnectAttempt: null
})

export const mutations = {
  sessionId (state, sessionId) {
    state.sessionId = sessionId
  },

  connectionStatus (state, value) {
    state.connectionStatus = value
  },

  reconnectAttempt (state, value) {
    state.reconnectAttempt = value
  },
}

export const actions = {
  async startServer ({ commit, dispatch }, game) {
    const { $server } = this._vm
    commit('game/clear', null, { root: true })
    await $server.start(game)
    await dispatch('connect', 'localhost')
  },

  async connect ({ state, commit, dispatch, rootState }, host) {
    if (state.connectionStatus !== STATUS_RECONNECTING) {
      commit('connectionStatus', STATUS_CONNECTING)
    }
    commit('gameSetup/clear', null, { root: true })
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
          commit('connectionStatus', STATUS_CONNECTED)
          commit('reconnectAttempt', null)
          resolve()
        } else if (type === 'SLOT') {
          dispatch('game/handleSlotMessage', payload, { root: true })
        } else if (type === 'START') {
          dispatch('game/handleStartMessage', payload, { root: true })
          this.$router.push('/game')
        } else if (type === 'GAME') {
          dispatch('game/handleGameMessage', payload, { root: true })
          if (payload.started) {
            dispatch('game/handleStartMessage', null, { root: true })
            this.$router.push('/game')
          } else {
            this.$router.push('/open-game')
            const { preferredColor } = rootState.settings
            if (preferredColor !== null && !payload.replay) {
              // player has auto assign enabled and game is a new game
              const slot = payload.slots.find(s => s.number === preferredColor && !s.clientId)
              if (slot) {
                dispatch('gameSetup/takeSlot', { number: slot.number }, { root: true })
              }
            }
          }
        } else {
          console.error(payload)
          console.error(`Unhandled message ${type}`)
        }
      }
      const onClose = (errCode) => {
        const reconnecting = state.connectionStatus === STATUS_RECONNECTING
        if (errCode === 1006 || reconnecting) {
          const attempt = reconnecting ? state.reconnectAttempt + 1 : 1
          let delay
          if (attempt === 1) {
            delay = 250
          } else if (attempt <= 3) {
            delay = 1000
          } else if (attempt <= 5) {
            delay = 2000
          } else {
            delay = 6000
          }
          commit('connectionStatus', STATUS_RECONNECTING)
          commit('reconnectAttempt', attempt)
          reconnectTimeout = setTimeout(async () => {
            reconnectTimeout = null
            try {
              await dispatch('connect', host)
            } catch (err) {
              // do nothing, reconnect is handled from on Close
            }
          }, delay)
        } else {
          commit('connectionStatus', null)
        }
      }
      $connection.connect(host, { onMessage, onClose }).catch(err => reject(err))
    })
  },

  close () {
    const { $server, $connection } = this._vm
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null;
    }
    $connection.disconnect()
    $server.stop()
  }
}
