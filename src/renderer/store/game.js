import fs from 'fs'
import { remote } from 'electron'

import difference from 'lodash/difference'
import range from 'lodash/range'
import zip from 'lodash/zip'
import Vue from 'vue'

import { isSameFeature } from '@/utils/gameUtils'
import { verifyScenario } from '@/utils/testing'

const { app } = remote

const SAVED_GAME_FILTERS = [{ name: 'Saved Game', extensions: ['jcz'] }]

// chiild process can't be part of store itself, because it's internals are mutated be own
// causing Error: [vuex] do not mutate vuex store state outside mutation handlers
// theme $engine is used instead to store engine instance
export const state = () => ({
  id: null,
  owner: null,
  setup: null,
  slots: null,
  players: null,
  tilePack: null,
  placedTiles: null,
  discardedTiles: null,
  deployedMeeples: null,
  tokens: null,
  bazaar: null,
  sheep: null,
  phase: null,
  action: null,
  history: null,
  undo: false,
  initialSeed: null,
  gameMessages: null,
  gameAnnotations: {},
  testScenario: null,
  testScenarioResult: null
})

export const mutations = {
  clear (state) {
    state.id = null
    state.owner = null,
    state.setup = null
    state.slots = null,
    state.players = null
    state.tilePack = null
    state.placedTiles = null
    state.discardedTiles = null
    state.deployedMeeples = null
    state.tokens = null
    state.bazaar = null
    state.sheep = null
    state.phase = null
    state.action = null
    state.history = null
    state.undo = false
    state.initialSeed = null
    state.gameMessages = null
    state.gameAnnotations = {}
    state.testScenario = null
    state.testScenarioResult = null
  },

  id (state, value) {
    state.id = value
  },

  owner (state, value) {
  state.owner = value
  },

  setup (state, value) {
    state.setup = value
  },

  slot (state, slot) {
    const idx = state.slots.findIndex(s => s.number === slot.number)
    Vue.set(state.slots, idx, slot)
  },

  slots (state, slots) {
    state.slots = slots
  },

  players (state, players) {
    state.players = players
  },

  update (state, data) {
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'players') {
        state.players = zip(state.players, data.players).map(([a, b]) => ({ ...a, ...b }))
      } else {
        Vue.set(state, key, value)
      }
    })
    if (data.action === undefined) {
      state.action = null
    }
  },

  initialSeed (state, value) {
    state.initialSeed = value
  },

  appendMessage (state, msg) {
    state.gameMessages.push(msg)
  },

  gameMessages (state, gameMessages) {
    state.gameMessages = gameMessages
  },

  gameAnnotations (state, gameAnnotations) {
    state.gameAnnotations = gameAnnotations
  },

  testScenario (state, value) {
    state.testScenario = value
  },

  testScenarioResult (state, value) {
    state.testScenarioResult = value
  }
}

export const getters = {
  // playerSlot: state => idx => state.setup.players[idx].slot,
  colorCssClass: state => player => 'color color-' + state.players[player].slot,

  tunnelTokenColorCssClass: state => (token, player, inactive = false) => {
    const [prefix, letter] = token.split('_', 2)
    if (prefix !== 'TUNNEL') {
      return ''
    }
    const fillCss = inactive ? 'color-inactive-fill' : 'color-fill'
    if (letter === 'A') {
      const { slot } = state.players[player]
      return `color-${slot} ${fillCss} color-overlay`
    }

    const emptySlots = difference(range(9), state.players.map(p => p.slot))
    const slot = emptySlots[player + (letter === 'B' ? 0 : state.players.length)]
    return `color-${slot} ${fillCss} color-overlay`
  },

  tileOn: state => pos => {
    return state.placedTiles.find(({ position: p }) => p[0] === pos[0] && p[1] === pos[1])
  },

  featureOn: state => ({ position, location }) => {
    if (location === 'MONASTERY') {
      location = 'CLOISTER'
    }
    return state.features.find(({ places }) => {
      return !!places.find(p => p[0] === position[0] && p[1] === position[1] && p[2] === location)
    })
  },

  meepleIdFromSupply: state => (playerIdx, meepleType) => {
    // what about keep followers and meepkes in same structure
    return state.players[playerIdx].meeples[meepleType][1]
  },


  canPayRansom: state => player => {
    if (state.action === null || state.action.player !== player) {
      return false
    }
    if (!state.history.length) {
      return false
    }
    const currentTurn = state.history[state.history.length - 1]
    return !currentTurn.events.find(ev => ev.type === 'ransom-paid')
  },

  currentTurnLastEvent: state => {
    if (!state.history || state.history.length === 0) {
      return null
    }
    const h = state.history[state.history.length - 1]
    return h.events.length ? h.events[h.events.length - 1] : null
  },

  bridges: state => {
    if (state.setup && state.setup.elements.bridge && state.history) {
      return state.history.flatMap(h => h.events.filter(ev => ev.type === 'token-placed' && ev.token === 'BRIDGE').map(ev => ev.to))
    }
    return []
  },

  isDeployedOnBridge: (state, getters) => meeple => {
    if (meeple.location !== 'NS' && meeple.location !== 'WE') {
      return false
    }
    return !!getters.bridges.find(b => isSameFeature(meeple, b))
  },

  castles: state => {
    if (state.setup && state.setup.elements.castle && state.history) {
      return state.history.flatMap(h => h.events.filter(ev => ev.type === 'castle-created'))
    }
    return []
  }
}

export const actions = {
  async save ({ state, dispatch }) {
    return new Promise(async (resolve, reject) => {
      const { dialog } = remote
      const { filePath } = await dialog.showSaveDialog({
        title: 'Save Game',
        filters: SAVED_GAME_FILTERS,
        properties: ['createDirectory', 'showOverwriteConfirmation']
      })
      if (filePath) {
        const version = process.env.NODE_ENV === 'development' ? process.env.npm_package_version : app.getVersion()
        const content = {
          appVersion: version,
          gameId: state.id,
          name: '',
          initialSeed: state.initialSeed,
          created: (new Date()).toISOString(),
          clock: null,
          setup: state.setup,
          players: state.players.map(p => ({
            name: p.name,
            slot: p.slot,
            clientId: p.clientId
          })),
          replay: state.gameMessages
        }

        if (Object.keys(state.gameAnnotations).length) {
          content.gameAnnotations = state.gameAnnotations
        }

        fs.writeFile(filePath, JSON.stringify(content, null, 2), err => {
          if (err) {
            reject(err)
          } else {
            Vue.nextTick(() => {
              dispatch('settings/addRecentSave', filePath, { root: true })
            })
            resolve(filePath)
          }
        })
      } else {
        resolve(null)
      }
    })
  },

  async load ({ commit, dispatch }, filePath) {
    return new Promise(async (resolve, reject) => {
      const { dialog } = remote
      if (!filePath) {
        const { filePaths } = await dialog.showOpenDialog({
          title: 'Load Game',
          filters: SAVED_GAME_FILTERS,
          properties: ['openFile']
        })
        if (filePaths.length) {
          filePath = filePaths[0]
        } else {
          resolve(false)
        }
      }
      let sg, slots
      try {
        const data = await fs.promises.readFile(filePath)
        sg = JSON.parse(data)
        slots = sg.players.map((p, i) => {
          return {
            number: p.slot,
            name: p.name,
            clientId: p.clientId,
            sessionId: null,
            order: i + 1
          }
        })
      } catch (e) {
        reject(e)
        return
      }

      dispatch('networking/startServer', {
        gameId: sg.gameId,
        setup: sg.setup,
        initialSeed: sg.initialSeed,
        gameAnnotations: sg.gameAnnotations || {},
        slots: slots,
        replay: sg.replay,
      }, { root: true })

      // TOOO trigger slot messages
      // commit('gameSetup/slots', slots, { root: true })
      if (sg.test) {
        commit('testScenario', sg.test)

        // const players = slots.map(s => ({ ...s }))
        // players.forEach(s => {
        //   s.slot = s.number
        //   delete s.number
        //   delete s.order
        // })
        // commit('game/players', players, { root: true })
        dispatch('game/start', null, { root: true })
      }
      Vue.nextTick(() => {
        dispatch('settings/addRecentSave', filePath, { root: true })
      })
      resolve(sg)
    })
  },

  async handleGameMessage ({ commit }, payload) {
    commit('clear')
    commit('id', payload.gameId)
    commit('setup', payload.setup)
    commit('slots', payload.slots)
    commit('initialSeed', payload.initialSeed)
    commit('gameAnnotations', payload.gameAnnotations)
    commit('gameMessages', payload.replay)
    commit('owner', payload.owner)
  },

  handleSlotMessage ({ state, commit }, payload) {
    if (state.gameMessages === null) {
      if (payload.sessionId) {
        const order = state.slots.filter(s => s.sessionId).length + 1
        commit('slot', { ...payload, order })
      } else {
        const order = state.slots.find(s => s.number === payload.number).order
        for (let i = 0; i < state.slots.length; i++) {
          const slot = state.slots[i]
          if (slot.sessionId && slot.order > order) {
            commit('slot', { ...slot, order: slot.order - 1 })
          }
        }
        commit('slot', payload)
      }
    } else {
      commit('slot', payload)
    }
  },

  async start () {
    const { $connection } = this._vm
    $connection.send({ type: 'START'})
  },

  async handleStartMessage ({ state, commit, dispatch, rootState }) {
    const players = state.slots.filter(s => s.sessionId).map(s => ({ ...s }))
    players.sort((a, b) => a.order - b.order)
    players.forEach(s => {
      s.slot = s.number
      delete s.number
      delete s.order
    })
    commit('players', players)
    commit('board/resetZoom', null, { root: true })

    console.log(state.setup, state.gameAnnotations)

    const loggingEnabled = rootState.settings.devMode
    const engine = this._vm.$engine.spawn({ loggingEnabled })
    engine.on('error', data => {
      const { dialog } = remote
      dialog.showErrorBox('Engine error', data)
    })
    engine.on('message', payload => {
      const lastMessageType = engine.lastMessage?.type
      const local = rootState.networking.sessionId === state.players[payload?.action.player]?.sessionId
      let autoCommit = false
      if (local) {
        if (payload.phase === 'CommitActionPhase') {
          autoCommit = !payload.undo || lastMessageType === 'PASS' || lastMessageType === 'EXCHANGE_FOLLOWER'
        } else if (payload.phase === 'CommitAbbeyPassPhase') {
          autoCommit = true
        }
      }
      if (autoCommit) {
        dispatch('apply', { type: 'COMMIT', payload: {} })
      } else {
        commit('update', payload)
        if (state.testScenario) {
          commit('testScenarioResult', verifyScenario(state, state.testScenario))
        }
      }
    })

    if (state.gameMessages?.length) {
      engine.writeDirective('%bulk on')
    }

    let annotations = {}
    if (Object.keys(state.gameAnnotations).length) {
      const { drawOrder, endTurn } = state.gameAnnotations
      if (drawOrder || endTurn) {
        const params = {
          drawOrder: drawOrder || []
        }
        if (endTurn) {
          params.drawLimit = endTurn
        }
        annotations = {
          tilePack: {
            className: 'com.jcloisterzone.debug.ForcedDrawTilePack',
            params
          }
        }
      }
    }

    await engine.writeMessage({
      type: 'GAME_SETUP',
      payload: {
        ...state.setup,
        players: players.length,
        initialSeed: state.initialSeed,
        gameAnnotations: annotations
      }
    })
    if (state.gameMessages?.length) {
      for (const msg of state.gameMessages) {
        await engine.writeMessage(msg)
      }
      engine.writeDirective('%bulk off')
    }

    if (state.gameMessages === null) {
      commit('gameMessages', [])
    }
  },

  close ({ dispatch }) {
    console.log("Game close requested")
    const { $engine } = this._vm
    dispatch('networking/close', null, { root: true })
    $engine.kill()
  },

  async apply (ctx, message) {
    const { $connection } = this._vm
    $connection.send(message)
  },

  async handleEngineMessage ({ commit }, message) {
    const engine = this._vm.$engine.get()
    await engine.writeMessage(message)
    commit('appendMessage', message)
  },

  async undo ({ dispatch }) {
    await dispatch('apply', {
      type: 'UNDO',
      payload: {}
    })
  }
}
