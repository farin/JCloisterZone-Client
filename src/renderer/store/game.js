import fs from 'fs'
import path from 'path'
import { kill } from 'process'
import { remote } from 'electron'

import debounce from 'lodash/debounce'
import difference from 'lodash/difference'
import range from 'lodash/range'
import zip from 'lodash/zip'
import Vue from 'vue'

import { randomLong } from '@/utils/random'
import { isSameFeature } from '@/utils/gameUtils'
import { verifyScenario } from '@/utils/testing'

const { app } = remote

const SAVED_GAME_FILTERS = [{ name: 'Saved Game', extensions: ['jcz'] }]

let engine = null

export const state = () => ({
  id: null,
  setup: null,
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
  gameMessages: [],
  gameAnnotations: {},
  testScenario: null,
  testScenarioResult: null
})

export const mutations = {
  clear (state) {
    state.id = null
    state.setup = null
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
    state.gameMessages = []
    state.gameAnnotations = {}
    state.testScenario = null
    state.testScenarioResult = null
  },

  id (state, value) {
    state.id = value
  },

  enginePid (state, value) {
    state.enginePid = value
  },

  setup (state, value) {
    state.setup = value
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

  // lastEvent: state => {
  //   if (!state.history) {
  //     return null
  //   }
  //   let idx = state.history.length - 1
  //   while (idx >= 0) {
  //     const h = state.history[idx]
  //     if (h.events.length) {
  //       return h.events[h.events.length - 1]
  //     }
  //     idx--
  //   }
  //   return null
  // },

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
  create ({ commit }) {
    commit('clear')
    commit('gameMessages', [])
    commit('gameSetup/clear', null, { root: true })
  },

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
          players: state.players.map(p => ({ name: p.name, slot: p.slot })),
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
            state: 'local',
            order: i + 1
          }
        })
      } catch (e) {
        reject(e)
        return
      }

      commit('clear')
      commit('id', sg.gameId)
      commit('setup', sg.setup)
      commit('initialSeed', sg.initialSeed)
      commit('gameAnnotations', sg.gameAnnotations || {})
      commit('gameMessages', sg.replay)
      commit('gameSetup/slots', slots, { root: true })
      if (sg.test) {
        commit('testScenario', sg.test)

        const players = slots.map(s => ({ ...s }))
        players.forEach(s => {
          s.slot = s.number
          delete s.number
          delete s.order
        })
        commit('game/players', players, { root: true })
        dispatch('game/start', null, { root: true })
      }
      Vue.nextTick(() => {
        dispatch('settings/addRecentSave', filePath, { root: true })
      })
      resolve(sg)
    })
  },

  async start ({ state, commit, dispatch, rootState }) {
    if (!state.initialSeed) {
      commit('initialSeed', randomLong().toString())
    }

    commit('board/resetZoom', null, { root: true })

    console.log(state.setup)

    const loggingEnabled = rootState.settings.devMode
    engine = await dispatch('spawnEngine', { loggingEnabled }, { root: true })
    engine.on('error', data => {
      dialog.showErrorBox('Engine error', data)
    })
    engine.on('exit', () => {
      engine = null
    })
    engine.on('message', payload => {
      const lastMessageType = engine.lastMessage?.type
      let autoCommit = false
      if (payload.phase === 'CommitActionPhase') {
        autoCommit = !payload.undo || lastMessageType === 'PASS' || lastMessageType === 'EXCHANGE_FOLLOWER'
      } else if (payload.phase === 'CommitAbbeyPassPhase') {
        autoCommit = true
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


    if (state.gameMessages.length) {
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
        players: state.players.length,
        initialSeed: state.initialSeed,
        gameAnnotations: annotations
      }
    })
    if (state.gameMessages.length) {
      for (const msg of state.gameMessages) {
        await engine.writeMessage(msg)
      }
      engine.writeDirective('%bulk off')
    }
  },

  close ({ state, commit }) {
    if (state.enginePid) {
      console.log(`Sending TERM to game engine ${state.enginePid}`)
      kill(state.enginePid)
      commit('enginePid', null)
      delete openGames[state.engineProcess]
    }
  },

  async apply ({ commit }, message) {
    const salted = ['COMMIT', 'FLOCK_EXPAND_OR_SCORE'].includes(message.type) || (message.type === 'DEPLOY_MEEPLE' && message.payload.pointer.location === 'FLYING_MACHINE')
    if (salted) {
      message = {
        ...message,
        payload: {
          ...message.payload,
          salt: randomLong().toString()
        }
      }
    }
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
