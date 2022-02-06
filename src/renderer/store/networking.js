import last from 'lodash/last'

import { ENGINE_MESSAGES } from '@/constants/messages'
import { connectExceptionToMessage } from '@/utils/networking'

export const STATUS_CONNECTING = 'connecting'
export const STATUS_RECONNECTING = 'reconnecting'
export const STATUS_CONNECTED = 'connected'

let reconnectTimeout = null

class ConnectionHandler {
  constructor (ctx, host, $router, $addons, $connection, resolve) {
    this.ctx = ctx
    this.host = host
    this.$router = $router
    this.$addons = $addons
    this.$connection = $connection
    this.resolve = resolve
    this.messageBuffer = []
    this.onMessageLock = false
  }

  async onMessage (message) {
    this.messageBuffer.push(message)
    if (!this.onMessageLock) {
      this.onMessageLock = true
      while (this.messageBuffer.length) {
        await this.processMessage(this.messageBuffer.shift())
      }
      this.onMessageLock = false
    }
  }

  async processMessage (message) {
    const { commit, state, dispatch, rootState } = this.ctx
    const { type, payload } = message
    if (ENGINE_MESSAGES.has(type)) {
      await dispatch('game/handleEngineMessage', message, { root: true })
    } else if (type === 'WELCOME') {
      const reconnected = !!state.reconnectAttempt
      commit('sessionId', payload.sessionId)
      commit('connectionStatus', STATUS_CONNECTED)
      commit('reconnectAttempt', null)
      if (state.connectionType === 'online') {
        if (reconnected && rootState.game.id) {
          const payload = { gameId: rootState.game.id }
          const lastMsg = last(rootState.game.gameMessages)
          if (lastMsg) {
            payload.lastMessage = {
              id: lastMsg.id,
              seq: lastMsg.seq
            }
          }
          await this.$connection.send({
            type: 'JOIN_GAME',
            payload
          })
        } else {
          this.$router.push('/online')
        }
      }
      this.resolve()
    } else if (type === 'GAME_LIST') {
      commit('online/gameList', payload.games, { root: true })
    } else if (type === 'SLOT') {
      await dispatch('game/handleSlotMessage', payload, { root: true })
    } else if (type === 'START') {
      await dispatch('game/handleStartMessage', message, { root: true })
      if (!rootState.runningTests) {
        this.$router.push('/game')
      }
    } else if (type === 'RENAME_GAME') {
      if (payload.gameId === rootState.game.id) {
        commit('game/name', payload.name, { root: true })
      }
    } else if (type === 'GAME') {
      if (payload.setup.addons) {
        const missing = this.$addons.findMissingAddons(payload.setup.addons)
        if (missing.length) {
          await dispatch('close')
          const msg = `Remote game requires addon(s) which are not installed:\n\n${missing.join(', ')}`
          commit('errorMessage', { title: 'Missing addons', content: msg }, { root: true })
          return
        }
      }

      if (payload.replay === true) {
        payload.replay = rootState.game.gameMessages
      }

      await dispatch('game/handleGameMessage', payload, { root: true })
      if (payload.state === 'R' || payload.state === 'F') { // running or finished
        await dispatch('game/handleStartMessage', {
          clock: message.clock,
          id: null,
          payload: {}
        }, { root: true })

        if (!rootState.runningTests) {
          if (this.$router.currentRoute.path !== '/game') {
            commit('board/reset', null, { root: true })
            this.$router.push('/game')
          }
        }
      } else {
        commit('board/reset', null, { root: true })
        if (!rootState.runningTests) {
          this.$router.push('/open-game')
          const { preferredColor } = rootState.settings
          if (preferredColor !== null && !payload.replay) {
            // player has auto assign enabled and game is a new game
            const slot = payload.slots.find(s => s.number === preferredColor && !s.clientId)
            if (slot) {
              await dispatch('gameSetup/takeSlot', { number: slot.number }, { root: true })
            }
          }
        }
      }
    } else if (type === 'GAME_UPDATE') {
      await dispatch('online/gameUpdate', payload, { root: true })
    } else if (type === 'GAME_OPTION') {
      commit('game/options', { [payload.key]: payload.value }, { root: true })
    } else {
      console.error(payload)
      throw new Error(`Unhandled message ${type}`)
    }
  }

  async onClose (errCode) {
    const { state, commit, dispatch } = this.ctx
    const reconnecting = state.connectionStatus === STATUS_RECONNECTING
    if ([1001, 1006, 1007, 4001].includes(errCode) || reconnecting) {
      const attempt = reconnecting ? state.reconnectAttempt + 1 : 1
      let delay
      if (attempt === 1) {
        delay = 250
      } else if (attempt < 3) {
        delay = 1000
      } else if (attempt <= 5) {
        delay = 2000
      } else {
        delay = 6000
      }
      commit('connectionStatus', STATUS_RECONNECTING)
      commit('reconnectAttempt', attempt)
      console.log(`Connection interrupted. Next attempt (${attempt}) in ${delay}ms`)
      reconnectTimeout = setTimeout(async () => {
        reconnectTimeout = null
        try {
          await dispatch('connect', { host: this.host, connectionType: state.connectionType })
        } catch (err) {
          if (!err.error?.errno) {
            // unexpected error
            console.error(err)
          }
          // do nothing, reconnect is handled from on Close
        }
      }, delay)
    } else {
      if (state.connectionType === 'online') {
        await dispatch('online/onClose', null, { root: true })
        this.$router.push('/')
      }
      commit('connectionStatus', null)
    }
  }
}

export const state = () => ({
  sessionId: null,
  connectionType: null, // direct / online
  connectionStatus: null,
  reconnectAttempt: null
})

export const mutations = {
  sessionId (state, sessionId) {
    state.sessionId = sessionId
  },

  connectionType (state, connectionType) {
    state.connectionType = connectionType
  },

  connectionStatus (state, value) {
    state.connectionStatus = value
  },

  reconnectAttempt (state, value) {
    state.reconnectAttempt = value
  }
}

export const actions = {
  async startServer ({ state, commit, dispatch }, game) {
    if (state.connectionType === 'online') {
      const { $connection } = this._vm
      $connection.send({
        type: 'CREATE_GAME',
        payload: {
          name: '',
          setup: game.setup,
          slots: game.slots.length
        }
      })
    } else {
      const { $server } = this._vm
      await $server.start(game)
      try {
        await dispatch('connect', { host: 'localhost', connectionType: 'direct' })
      } catch (err) {
        console.error(err)
        commit('errorMessage', { title: 'Engine error', content: err.message || err + '' }, { root: true })
      }
    }
  },

  async connect (ctx, { host, connectionType }) {
    const { state, commit, rootState } = ctx
    if (state.connectionStatus !== STATUS_RECONNECTING) {
      commit('connectionType', connectionType)
      commit('connectionStatus', STATUS_CONNECTING)
    }
    const { $connection, $addons } = this._vm
    if (!host.match(/:\d+/) && connectionType === 'direct') {
      host = `${host}:${rootState.settings.port}`
    }
    if (!host.match(/^\w+:\/\//)) {
      host = 'ws://' + host
    }
    return new Promise((resolve, reject) => {
      const handler = new ConnectionHandler(ctx, host, this.$router, $addons, $connection, resolve)
      $connection.connect(host, {
        onMessage: handler.onMessage.bind(handler),
        onClose: handler.onClose.bind(handler)
      }).catch(err => {
        if (state.connectionStatus !== STATUS_RECONNECTING) {
          commit('connectionType', null)
          commit('connectionStatus', null)
        }
        reject(err)
      })
    })
  },

  async connectPlayOnline ({ dispatch, commit, rootState }) {
    const host = rootState.settings.playOnlineUrl
    if (host) {
      try {
        await dispatch('connect', { host, connectionType: 'online' })
      } catch (e) {
        const title = e.type === 'ERR' ? 'Connection has been rejected.' : 'Unable to connect'
        const content = connectExceptionToMessage(e)
        commit('errorMessage', { title, content }, { root: true })
        console.error(e)
      }
    }
  },

  close ({ commit, rootState }) {
    const { $server, $connection } = this._vm
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    $connection.disconnect()
    $server.stop()
    commit('connectionType', null)
    commit('connectionStatus', null)
    commit('reconnectAttempt', null)
    if (!rootState.runningTests) {
      this.$router.push('/')
    }
  }
}
