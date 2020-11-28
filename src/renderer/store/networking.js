import { ENGINE_MESSAGES } from '@/constants/messages'
import { remote } from 'electron'

const STATUS_CONNECTING = 'connecting'
const STATUS_RECONNECTING = 'reconnecting'
const STATUS_CONNECTED = 'connected'

let reconnectTimeout = null

class ConnectionHandler {
  constructor (ctx, host, $router, resolve) {
    this.ctx = ctx
    this.host = host
    this.$router = $router
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
    const { commit, dispatch, rootState } = this.ctx
    const { type, payload } = message
    if (ENGINE_MESSAGES.has(type)) {
      await dispatch('game/handleEngineMessage', message, { root: true })
    } else if (type === 'WELCOME') {
      commit('sessionId', payload.sessionId)
      commit('connectionStatus', STATUS_CONNECTED)
      commit('reconnectAttempt', null)
      this.resolve()
    } else if (type === 'CHANNEL') {
      commit('online/channel', payload.name, { root: true })
      this.$router.push('/online')
    } else if (type === 'SLOT') {
      await dispatch('game/handleSlotMessage', payload, { root: true })
    } else if (type === 'START') {
      await dispatch('game/handleStartMessage', message, { root: true })
      this.$router.push('/game')
    } else if (type === 'GAME') {
      await dispatch('game/handleGameMessage', payload, { root: true })
      if (payload.started) {
        await dispatch('game/handleStartMessage', { clock: message.clock, id: null }, { root: true })
        if (this.$router.currentRoute.path !== '/game') {
          commit('board/resetZoom', null, { root: true })
          this.$router.push('/game')
        }
      } else {
        commit('board/resetZoom', null, { root: true })
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
    } else if (type === 'GAME_UPDATE') {
      await dispatch('online/gameUpdate', payload, { root: true })
    } else {
      console.error(payload)
      throw new Error(`Unhandled message ${type}`)
    }
  }

  async onClose (errCode) {
    const { state, commit, dispatch, rootState } = this.ctx
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
      if (rootState.online.channel) {
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
  async startServer ({ state, commit, dispatch, rootState }, game) {
    commit('game/clear', null, { root: true })
    if (state.connectionType === 'online') {
      const { $connection } = this._vm
      $connection.send({
        type: 'CREATE_GAME',
        payload: {
          name: 'Test game',
          channel: rootState.online.channel,
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
        const { dialog } = remote
        dialog.showErrorBox('Engine error', err.message || err + '')
      }
    }
  },

  async connect (ctx, { host, connectionType }) {
    const { state, commit, rootState } = ctx
    if (state.connectionStatus !== STATUS_RECONNECTING) {
      commit('connectionType', connectionType)
      commit('connectionStatus', STATUS_CONNECTING)
    }
    commit('gameSetup/clear', null, { root: true })
    const { $connection } = this._vm
    if (!host.match(/:\d+/)) {
      host = `${host}:${rootState.settings.port}`
    }
    if (!host.match(/^\w+:\/\//)) {
      host = 'ws://' + host
    }
    return new Promise((resolve, reject) => {
      const handler = new ConnectionHandler(ctx, host, this.$router, resolve)
      $connection.connect(host, {
        onMessage: handler.onMessage.bind(handler),
        onClose: handler.onClose.bind(handler)
      }).catch(err => {
        reject(err)
      })
    })
  },

  async connectPlayOnline ({ dispatch, rootState }) {
    dispatch('connect', { host: rootState.settings.playOnlineUrl, connectionType: 'online' })
  },

  close () {
    const { $server, $connection } = this._vm
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    $connection.disconnect()
    $server.stop()
  }
}
