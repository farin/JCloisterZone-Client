import fs from 'fs'
import path from 'path'
import { kill } from 'process'
import { remote } from 'electron'

import debounce from 'lodash/debounce'
import difference from 'lodash/difference'
import range from 'lodash/range'
import zip from 'lodash/zip'
import Vue from 'vue'

import { Expansion } from '@/models/expansions'
import { randomLong } from '@/utils/random'
import { isSameFeature } from '@/utils/game'
import { verifyScenario } from '@/utils/testing'

const { app } = remote

const isDev = process.env.NODE_ENV === 'development'
const SAVED_GAME_FILTERS = [{ name: 'Saved Game', extensions: ['jcz'] }]

const openGames = {}

export const state = () => ({
  enginePid: null,
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
    state.enginePid = null
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

  getTileSets: state => {
    if (!state.setup) {
      return null
    }
    const sets = []
    const setupSets = state.setup.sets
    Expansion.all().forEach(expansion => {
      expansion.sets.forEach(set => {
        const quantity = setupSets[set.id] || setupSets[set.id + ':1'] || setupSets[set.id + ':2']
        if (quantity) {
          sets.push({ expansion, set, quantity })
        }
      })
    })
    return sets
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

const writeLine = async (pid, line) => {
  const openGame = openGames[pid]
  return new Promise(resolve => {
    openGame.engine.stdin.write(line + '\n', 'utf-8', resolve)
  })
}

const writeMessage = async (pid, message) => {
  const openGame = openGames[pid]
  if (isDev) {
    console.groupCollapsed(message.type)
    console.log(message.payload)
    console.groupEnd()
  }

  openGame.lastMessage = message
  return new Promise(resolve => {
    openGame.engine.stdin.write(JSON.stringify(message) + '\n', 'utf-8', resolve)
  })
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
        const version = isDev ? process.env.npm_package_version : app.getVersion()
        const content = {
          appVersion: version,
          gameId: '1',
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
        filePath = filePaths.length ? filePaths[0] : null
      }
      if (filePath) {
        fs.readFile(filePath, async (err, data) => {
          if (err) {
            reject(err)
            return
          }
          const sg = JSON.parse(data)
          const slots = sg.players.map((p, i) => {
            return {
              number: p.slot,
              name: p.name,
              state: 'local',
              order: i + 1
            }
          })
          commit('clear')
          commit('setup', sg.setup)
          commit('initialSeed', sg.initialSeed)
          commit('gameAnnotations', sg.gameAnnotations || {})
          commit('gameMessages', sg.replay)
          commit('gameSetup/slots', slots, { root: true })
          if (sg.test) {
            commit('testScenario', sg.test)
          }
          Vue.nextTick(() => {
            dispatch('settings/addRecentSave', filePath, { root: true })
          })
          resolve(true)
        })
      } else {
        resolve(false)
      }
    })
  },

  async start ({ state, commit, dispatch }) {
    if (!state.initialSeed) {
      commit('initialSeed', randomLong().toString())
    }

    commit('board/resetZoom', null, { root: true })

    console.log(state.setup)
    console.log('seed is ' + state.initialSeed)

    const engine = await dispatch('spawnEngine', null, { root: true })

    console.log(`Engine started ${engine.pid}`)
    openGames[engine.pid] = { engine, lastMessage: null }
    commit('enginePid', engine.pid)

    let stdoutData = []
    let stderrData = []

    const displayError = debounce(() => {
      const { dialog } = remote
      if (stderrData.length) {
        const data = stderrData.join('\n')
        dialog.showErrorBox('Engine error', data)
        stderrData = []
      }
    }, 100)

    engine.stdout.on('data', data => {
      data = data.toString()
      if (!data) {
        return
      }

      if (!data.endsWith('\n')) {
        stdoutData.push(data)
        return
      } else if (stdoutData.length) {
        stdoutData.push(data)
        data = stdoutData.join('')
        stdoutData = []
      }

      let payload
      try {
        payload = JSON.parse(data)
        if (isDev) {
          console.debug(payload)
        }
      } catch (e) {
        console.error('Received invalid json: ' + data)
        console.error(e)
        return
      }

      const { lastMessage } = openGames[engine.pid]
      const lastMessageType = lastMessage ? lastMessage.type : null
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

    engine.stderr.on('data', data => {
      data = data.toString().trim() // convert buffer to string
      console.error(data)
      stderrData.push(data)
      displayError()
    })

    if (state.gameMessages.length) {
      await writeLine(engine.pid, '%bulk on')
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

    await writeMessage(engine.pid, {
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
        await writeMessage(engine.pid, msg)
      }
      await writeLine(engine.pid, '%bulk off')
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

  async apply ({ state, commit }, message) {
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
    await writeMessage(state.enginePid, message)
    commit('appendMessage', message)
  },

  async undo ({ dispatch }) {
    await dispatch('apply', {
      type: 'UNDO',
      payload: {}
    })
  }
}
