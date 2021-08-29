import { ENGINE_MESSAGES } from '@/constants/messages'
import { connectExceptionToMessage } from '@/utils/networking'
import { ipcRenderer } from 'electron'

const STATUS_CONNECTING = 'connecting'
const STATUS_RECONNECTING = 'reconnecting'
const STATUS_CONNECTED = 'connected'

let reconnectTimeout = null

class ConnectionHandler {
  constructor (ctx, host, $router, $addons, resolve) {
    this.ctx = ctx
    this.host = host
    this.$router = $router
    this.$addons = $addons
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
      commit('sessionId', payload.sessionId)
      commit('connectionStatus', STATUS_CONNECTED)
      commit('reconnectAttempt', null)
      if (state.connectionType === 'online') {
        this.$router.push('/online')
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
    } else if (type === 'GAME') {
      if (payload.setup.addons) {
        const missing = this.$addons.findMissingAddons(payload.setup.addons)
        if (missing.length) {
          await dispatch('close')
          const msg = `Remote game requires addon(s) which are not installed:\n\n${missing.join(', ')}`
          ipcRenderer.invoke('dialog.showErrorBox', { title: 'Missing addons', content: msg })
          return
        }
      }

      await dispatch('game/handleGameMessage', payload, { root: true })
      if (payload.state === 'R') { // running
        await dispatch('game/handleStartMessage', { clock: message.clock, id: null, payload: {} }, { root: true })
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
      if (state.connectionType === 'online') {
        await dispatch('online/onClose', null, { root: true })
      }
      commit('connectionStatus', STATUS_RECONNECTING)
      commit('reconnectAttempt', attempt)
      console.log(`Connection interrupted. Next attempt (${attempt}) in ${delay}ms`)
      reconnectTimeout = setTimeout(async () => {
        reconnectTimeout = null
        try {
          await dispatch('connect', { host: this.host })
        } catch (err) {
          if (!err.error?.errno) {
            // unexpected error
            console.error(err)
          }
          // do nothing, reconnect is handled from on Close
        }
      }, delay)
    } else {
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
  async startServer ({ state, dispatch }, game) {
    if (state.connectionType === 'online') {
      const { $connection } = this._vm
      $connection.send({
        type: 'CREATE_GAME',
        payload: {
          name: 'Test game',
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
        ipcRenderer.invoke('dialog.showErrorBox', { title: 'Engine error', content: err.message || err + '' })
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
    if (!host.match(/:\d+/)) {
      host = `${host}:${rootState.settings.port}`
    }
    if (!host.match(/^\w+:\/\//)) {
      host = 'ws://' + host
    }
    return new Promise((resolve, reject) => {
      const handler = new ConnectionHandler(ctx, host, this.$router, $addons, resolve)
      $connection.connect(host, {
        onMessage: handler.onMessage.bind(handler),
        onClose: handler.onClose.bind(handler)
      }).catch(err => {
        commit('connectionType', null)
        commit('connectionStatus', null)
        reject(err)
      })
    })
  },

  async connectPlayOnline ({ dispatch, rootState }) {
    const host = rootState.settings.playOnlineUrl
    if (host) {
      try {
        await dispatch('connect', { host, connectionType: 'online' })
      } catch (e) {
        const msg = connectExceptionToMessage(e)
        ipcRenderer.invoke('dialog.showErrorBox', { title: 'Unable to connect', content: msg })
        console.error(e)
      }
    }
  },

  close ({ commit }) {
    const { $server, $connection } = this._vm
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    $connection.disconnect()
    $server.stop()
    commit('connectionType', null)
    commit('connectionStatus', null)
  }
}
