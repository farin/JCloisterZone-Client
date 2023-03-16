import fs from 'fs'
import { extname } from 'path'
import { ipcRenderer } from 'electron'
import { compare } from 'compare-versions'

import difference from 'lodash/difference'
import pick from 'lodash/pick'
import sortBy from 'lodash/sortBy'
import omit from 'lodash/omit'
import range from 'lodash/range'
import zip from 'lodash/zip'
import isNil from 'lodash/isNil'
import groupBy from 'lodash/groupBy'
import Vue from 'vue'

import { SAVED_GAME_COMPATIBILITY } from '@/constants/versions'
import Location from '@/models/Location'
import { randomId } from '@/utils/random'
import { getAppVersion } from '@/utils/version'
import { isSameFeature } from '@/utils/gameUtils'
import { verifyScenario } from '@/utils/testing'
import { Rule, getDefaultRules } from '@/models/rules'

const SAVED_GAME_FILTERS = [{ name: 'Saved Game', extensions: ['jcz'] }]

const deployedOnField = (state, response) => {
  for (let i = 0; i < response.undo.depth; i++) {
    const msg = state.gameMessages[state.gameMessages.length - i - 1]
    if (msg.type === 'DEPLOY_MEEPLE') {
      const loc = Location.parse(msg.payload.pointer.location)
      if (loc?.isFieldLocation()) {
        return true
      }
    }
  }
  return false
}
const deployedOnTower = (state, response) => {
  for (let i = 0; i < response.undo.depth; i++) {
    const msg = state.gameMessages[state.gameMessages.length - i - 1]
    if (msg.type === 'DEPLOY_MEEPLE' && msg.payload.pointer?.feature === 'Tower') {
      return true
    }
  }
  return false
}

const computeClock = (playersCount, messages) => {
  const clocks = (new Array(playersCount)).fill(0)
  let active = 0
  let prevClock = 0
  messages.forEach(({ clock, player }) => {
    clocks[active] += clock - prevClock
    active = player
    prevClock = clock
  })
  return clocks
}

// chiild process can't be part of store itself, because it's internals are mutated be own
// causing Error: [vuex] do not mutate vuex store state outside mutation handlers
// theme $engine is used instead to store engine instance
export const state = () => ({
  id: null,
  compatAppVersion: null, // original app version in which was game created
  key: null,
  name: null,
  lastMessageId: null,
  owner: null,
  setup: null,
  packSize: null,
  slots: null,
  players: null,
  clock: null,
  lastMessageClock: null,
  lastMessageClockLocal: null,
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
  undo: {
    allowed: false,
    depth: 0
  },
  initialRandom: null,
  gameMessages: null,
  gameAnnotations: {},
  testScenario: null,
  testScenarioResult: null,
  lockUi: false,
  showGameStats: false
})

export const mutations = {
  clear (state) {
    state.id = null
    state.originAppVersion = null
    state.key = null
    state.name = null
    state.lastMessageId = null
    state.owner = null
    state.setup = null
    state.packSize = null
    state.slots = null
    state.players = null
    state.clock = null
    state.lastMessageClock = null
    state.lastMessageClockLocal = null
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
    state.initialRandom = null
    state.gameMessages = null
    state.gameAnnotations = {}
    state.testScenario = null
    state.testScenarioResult = null
    state.lockUi = false
    state.showGameStats = false
  },

  id (state, value) {
    state.id = value
  },

  originAppVersion (state, value) {
    state.originAppVersion = value
  },

  key (state, value) {
    state.key = value ? value.substring(0, 3) + '-' + value.substring(3) : null
  },

  name (state, value) {
    state.name = value
  },

  lastMessageId (state, value) {
    state.lastMessageId = value
  },

  owner (state, value) {
    state.owner = value
  },

  setup (state, value) {
    const { $tiles } = this._vm
    state.setup = value
    if (value) {
      state.packSize = $tiles.getPackSize(value.sets, value.rules)
    }
  },

  options (state, options) {
    Object.entries(options).forEach(([key, value]) => {
      Vue.set(state.setup.options, key, value)
    })
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

  resetClock (state, value) {
    if (value) {
      state.clock = value
    } else {
      const clock = new Array(state.players.length)
      state.clock = clock.fill(0)
    }
  },

  updateClock (state, { player, clock, shiftLocal = 0 }) {
    if (player !== null && player !== undefined) {
      Vue.set(state.clock, player, state.clock[player] + clock - state.lastMessageClock)
    }
    state.lastMessageClock = clock
    state.lastMessageClockLocal = Date.now() + shiftLocal
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

  initialRandom (state, value) {
    state.initialRandom = value
  },

  appendMessage (state, msg) {
    if (msg.type === 'UNDO') {
      state.gameMessages.pop()
    } else {
      state.gameMessages.push(msg)
    }
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
  },

  lockUi (state, value) {
    state.lockUi = value
  },

  showGameStats (state, value) {
    state.showGameStats = value
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
      return `color-${slot} ${fillCss} color-overlay tunnel`
    }

    const emptySlots = difference(range(9), state.players.map(p => p.slot))
    const slot = emptySlots[player + (letter === 'B' ? 0 : state.players.length)]
    return `color-${slot} ${fillCss} color-overlay tunnel`
  },

  tileOn: state => pos => {
    return state.placedTiles.find(({ position: p }) => p[0] === pos[0] && p[1] === pos[1])
  },

  featureOn: state => ({ position, location }) => {
    if (location === 'AS_ABBOT') {
      location = 'I'
    }
    return state.features.find(({ places }) => {
      return !!places.find(p => p[0] === position[0] && p[1] === position[1] && p[2] === location)
    })
  },

  meepleIdFromSupply: state => (playerIdx, meepleType) => {
    // what about keep followers and meepkes in same structure
    return state.players[playerIdx].meeples[meepleType][1]
  },

  canPayRansom: (state, getters, rootState) => player => {
    if (state.action === null || state.action.player !== player) {
      return false
    }
    if (state.players[player].sessionId !== rootState.networking.sessionId) {
      return false
    }
    return !state.flags.ransomPaid && state.history.length && state.players[player].points >= 3
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
  },

  isActionLocal (state, getters, rootState) {
    if (!state.action) {
      return false
    }
    const clientSessionId = rootState.networking.sessionId
    const actionSessionId = state.players[state.action.player].sessionId
    return clientSessionId === actionSessionId
  },

  localPlayers (state, getters, rootState) {
    const clientSessionId = rootState.networking.sessionId
    return state.players
      .map((p, index) => ({ sessionId: p.sessionId, index }))
      .filter(p => clientSessionId === p.sessionId)
      .map(p => p.index)
  },

  isUndoAllowed: (state, getters) => {
    return state.undo?.allowed && getters.isActionLocal
  },

  ranks (state) {
    const playersWithIndex = state.players.map((p, index) => ({ ...p, index }))
    const groups = groupBy(playersWithIndex, 'points')
    const points = Object.keys(groups).map(p => parseInt(p))
    points.sort((a, b) => b - a)
    let rank = 0
    const ranks = []
    points.forEach(p => {
      ranks.push({
        points: p,
        players: groups[p],
        rank: rank + 1
      })
      rank += groups[p].length
    })
    return ranks
  }
}

export const actions = {
  async save ({ state, dispatch }, { onlySetup = false } = {}) {
    return new Promise(async (resolve, reject) => { /* eslint no-async-promise-executor: 0 */
      let { filePath } = await ipcRenderer.invoke('dialog.showSaveDialog', {
        title: onlySetup ? 'Save Game Setup' : 'Save Game',
        filters: SAVED_GAME_FILTERS,
        properties: ['createDirectory', 'showOverwriteConfirmation']
      })
      if (filePath) {
        if (extname(filePath) === '') {
          filePath += '.jcz'
        }
        const rules = {}
        Rule.all().forEach(r => {
          const value = state.setup.rules[r.id]
          if (r.default !== value) rules[r.id] = value
        })
        const setup = { ...state.setup, rules }
        let content
        if (onlySetup) {
          content = {
            appVersion: getAppVersion(),
            created: (new Date()).toISOString(),
            setup
          }
        } else {
          const clock = state.lastMessageClock + Date.now() - state.lastMessageClockLocal
          content = {
            appVersion: state.originAppVersion || getAppVersion(),
            gameId: state.id,
            name: '',
            initialRandom: state.initialRandom,
            created: (new Date()).toISOString(),
            clock,
            setup,
            players: state.players.map(p => ({
              name: p.name,
              slot: p.slot,
              clientId: p.clientId
            })),
            replay: state.gameMessages.map(m => {
              m = pick(m, ['type', 'payload', 'player', 'clock'])
              m.payload = omit(m.payload, ['gameId'])
              return m
            })
          }
        }

        if (Object.keys(state.gameAnnotations).length) {
          content.gameAnnotations = state.gameAnnotations
        }

        fs.writeFile(filePath, JSON.stringify(content, null, 2), err => {
          if (err) {
            reject(err)
          } else {
            Vue.nextTick(() => {
              dispatch(onlySetup ? 'settings/addRecentSetupSave' : 'settings/addRecentSave', { file: filePath, setup }, { root: true })
            })
            resolve(filePath)
          }
        })
      } else {
        resolve(null)
      }
    })
  },

  async load ({ commit, dispatch, rootState }, { file: filePath, setupOnly = false } = {}) {
    return new Promise(async (resolve, reject) => {
      if (!filePath) {
        const { filePaths } = await ipcRenderer.invoke('dialog.showOpenDialog', {
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
        try {
          sg = JSON.parse(data)
        } catch (err) {
          commit('errorMessage', { title: 'File is not valid', content: err + '' }, { root: true })
          reject(err)
        }
        if (compare(sg.appVersion, SAVED_GAME_COMPATIBILITY, '<')) {
          const msg = `Saves created prior ${SAVED_GAME_COMPATIBILITY} are not supported.`
          commit('errorMessage', { title: 'Load Error', content: msg }, { root: true })
          reject(msg)
          return
        }

        if (sg.setup) {
          if (sg.setup.addons) {
            const { $addons } = this._vm
            if (sg.setup.addons) {
              const missing = $addons.findMissingAddons(sg.setup.addons)

              if (missing.length) {
                const msg = `Saved game (or setup) requires addon(s) which are not installed:\n\n${missing.join(', ')}`
                commit('errorMessage', { title: 'Load Error', content: msg }, { root: true })
                reject(msg)
                return
              }
            }
          }

          sg.setup.rules = { ...getDefaultRules(), ...sg.setup.rules }
        }

        const containsSetupOnly = isNil(sg.players) || isNil(sg.initialRandom) || isNil(sg.replay) || isNil(sg.clock) || isNil(sg.gameId)

        if (sg.setup && !sg.test && (containsSetupOnly || setupOnly)) {
          if (rootState.runningTests) {
            console.error('Loaded game setup from test runner')
          }
          dispatch('gameSetup/load', sg.setup, { root: true })
          if (containsSetupOnly) { // don't all file with game to recent setup saves
            Vue.nextTick(() => {
              dispatch('settings/addRecentSetupSave', {
                file: filePath,
                setup: sg.setup
              }, { root: true })
              this.$router.push('/game-setup')
              resolve(sg)
            })
          } else {
            resolve(sg)
          }
          return
        }

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

      if (sg.test) {
        slots.forEach(s => { s.clientId = rootState.settings.clientId })
      }

      commit('game/clear', null, { root: true })
      await dispatch('networking/startServer', {
        gameId: sg.gameId,
        originAppVersion: sg.appVersion,
        setup: {
          options: {},
          ...sg.setup
        },
        initialRandom: sg.initialRandom,
        gameAnnotations: sg.gameAnnotations || {},
        slots,
        replay: sg.replay,
        clock: sg.clock
      }, { root: true })

      if (sg.test) {
        commit('id', sg.gameId) // HACK, prevent clear when GAME message is received
        commit('testScenario', sg.test)
        dispatch('game/start', null, { root: true })
      }
      Vue.nextTick(() => {
        dispatch('settings/addRecentSave', { file: filePath, setup: sg.setup }, { root: true })
      })
      resolve(sg)

      if (!rootState.runningTests) {
        if (sg.test) {
          this.$router.push('/game')
        } else if (window.location.pathname !== '/open-game') { // don't redirect if loaded from bookmark tab
          this.$router.push('/open-game')
        }
      }
    })
  },

  async handleGameMessage ({ state, commit }, payload) {
    const occupiedSlots = sortBy(payload.slots.filter(s => s.order), 'order').map(s => s.number)
    const slots = payload.slots.map(s => {
      if (!s.order) return s
      return {
        ...s,
        order: occupiedSlots.indexOf(s.number) + 1
      }
    })

    if (payload.state === 'R') {
      commit('lockUi', true)
    }
    if (state.id !== payload.gameId) {
      commit('clear')
      commit('originAppVersion', payload.originAppVersion)
    }
    commit('name', payload.name || '')
    commit('key', payload.key || null)
    commit('setup', payload.setup)
    commit('slots', slots)
    commit('initialRandom', payload.initialRandom)
    commit('gameAnnotations', payload.gameAnnotations || {})
    commit('gameMessages', payload.replay)
    commit('owner', payload.owner)
    commit('id', payload.gameId) // set as latest commit, /open-game rendering waits for it
  },

  handleSlotMessage ({ state, commit }, payload) {
    if (state.gameMessages === null) {
      const selectedSlot = state.slots.find(s => s.number === payload.number)
      if (payload.sessionId) {
        if (selectedSlot.sessionId) {
          commit('slot', { ...payload, order: selectedSlot.order })
        } else {
          // take a slot
          const order = state.slots.filter(s => s.sessionId).length + 1
          commit('slot', { ...payload, order })
        }
      } else {
        const order = selectedSlot.order
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

  async start ({ state }) {
    const { $connection } = this._vm
    $connection.send({ type: 'START', payload: { gameId: state.id } })
  },

  async rename ({ state }, name) {
    const { $connection } = this._vm
    $connection.send({ type: 'RENAME_GAME', payload: { gameId: state.id, name: name.trim() } })
  },

  async handleStartMessage ({ state, commit, dispatch, rootState }, message) {
    const { $tiles } = this._vm
    let slots
    if (message.payload.seating) {
      const { seating } = message.payload
      slots = state.slots.map(slot => {
        if (seating[slot.number]) {
          return { ...slot, order: seating[slot.number] }
        }
        return slot
      })
      commit('slots', slots)
    } else {
      slots = state.slots
    }

    const players = slots.filter(s => s.clientId).map(s => ({ ...s }))
    players.sort((a, b) => a.order - b.order)
    players.forEach(s => {
      s.slot = s.number
      delete s.number
      delete s.order
    })
    if (state.players === null) {
      commit('players', players)
    } else {
      commit('update', { players })
    }
    commit('resetClock')

    const loggingEnabled = rootState.settings.devMode
    const engine = this._vm.$engine.spawn({ loggingEnabled })
    engine.on('error', data => {
      commit('errorMessage', { title: 'Engine error', content: data + '' }, { root: true })
    })

    // if (state.originAppVersion && state.originAppVersion !== getAppVersion()) {
    //   await engine.write(`%compat ${state.originAppVersion}`)
    // }

    for (const xml of this._vm.$tiles.xmls) {
      await engine.write(`%load ${xml}`)
    }

    if (state.gameMessages?.length) {
      await engine.enableBulkMode()
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

    // // uncomment for online server game finish debugging
    // annotations.tilePack = {
    //   className: 'com.jcloisterzone.debug.ForcedDrawTilePack',
    //   params: { drawLimit: 3 }
    // }

    const setupMessage = {
      type: 'GAME_SETUP',
      payload: {
        ...$tiles.getFullSetup(state.setup),
        gameId: state.id,
        players: players.length,
        initialRandom: state.initialRandom,
        gameAnnotations: annotations
      }
    }

    if (message.id) {
      commit('lastMessageId', message.id)
    }

    if (state.gameMessages?.length) {
      commit('resetClock', computeClock(players.length, state.gameMessages))
      await engine.writeMessage(setupMessage)
      for (const msg of state.gameMessages) {
        await engine.writeMessage(msg)
      }
      const lastMessage = state.gameMessages[state.gameMessages.length - 1]
      // TODO shift local
      commit('updateClock', { player: null, clock: lastMessage.clock, shiftLocal: lastMessage.clock - message.clock })
      const { response, hash } = await engine.disableBulkMode()
      await dispatch('applyEngineResponse', { response, hash, message: lastMessage, allowAutoCommit: false })
    } else {
      commit('updateClock', { player: null, clock: 0 })
      const { response, hash } = await engine.writeMessage(setupMessage)
      await dispatch('applyEngineResponse', { response, hash, message: null, allowAutoCommit: false })
    }
    if (state.gameMessages === null) {
      commit('gameMessages', [])
    }

    commit('lockUi', false)
  },

  close ({ dispatch, commit, rootState }) {
    console.log('Game close requested')
    commit('id', null)
    if (rootState.networking.connectionType !== 'online') {
      const { $engine } = this._vm
      dispatch('networking/close', null, { root: true })
      $engine.kill()
    }
  },

  async apply ({ state }, { type, payload, force = false }) {
    if (state.lockUi && !force) {
      return
    }
    const { $connection } = this._vm
    const id = randomId()
    const message = {
      id,
      type,
      payload: { ...payload, gameId: state.id },
      seq: 1 + state.gameMessages.length,
      player: state.action?.player
    }
    if (type === 'COMMIT') {
      const usedTiles = state.packSize - state.tilePack.size
      message.progress = `${usedTiles}/${state.packSize}`
    }

    $connection.send(message)
  },

  async handleEngineMessage ({ state, commit, dispatch, rootState }, message) {
    if (message.seq !== 1 + state.gameMessages.length) {
      console.warn(`Seq doesn't match ${message.seq} != ${1 + state.gameMessages.length}`)
      const { $connection } = this._vm
      $connection.send({ type: 'SYNC_GAME' })
      return
    }
    const engine = this._vm.$engine.get()
    const { response, hash } = await engine.writeMessage(message)
    commit('appendMessage', message)
    commit('lastMessageId', message.id)
    commit('updateClock', { player: state.action?.player, clock: message.clock || 0 })
    await dispatch('applyEngineResponse', { response, hash, message, allowAutoCommit: true })
  },

  async applyEngineResponse ({ state, commit, dispatch, rootState }, { response, hash, message, allowAutoCommit }) {
    const local = rootState.networking.sessionId === state.players[response.action?.player]?.sessionId
    let autoCommit = false
    if (local && allowAutoCommit) {
      const itemType = response.action.items.length ? response.action.items[0].type : null
      if (itemType === 'Confirm') {
        let confirm = response.undo.allowed && message?.type !== 'PASS' && message?.type !== 'EXCHANGE_FOLLOWER'
        if (confirm) {
          confirm = rootState.settings['confirm.always']
            || (rootState.settings['confirm.field'] && deployedOnField(state, response))
            || (rootState.settings['confirm.tower'] && deployedOnTower(state, response))
        }
        autoCommit = !confirm
      } else if (response.phase === 'CommitAbbeyPassPhase') {
        autoCommit = true
      }
    }
    if (autoCommit) {
      dispatch('apply', { type: 'COMMIT', payload: { gameId: state.id }, force: true })
    } else {
      const gameFinished = state.phase !== response.phase && response.phase === 'GameOverPhase'
      commit('update', response)
      if (state.testScenario) {
        commit('testScenarioResult', verifyScenario(state, state.testScenario))
      }

      if (gameFinished) {
        commit('showGameStats', true)
        dispatch('apply', {
          type: 'GAME_FINISHED',
          payload: {
            gameId: state.id,
            points: state.players.map(p => p.points)
          },
          force: true
        })
      }
    }
  },

  async undo ({ getters, dispatch }) {
    if (getters.isUndoAllowed) {
      await dispatch('apply', {
        type: 'UNDO',
        payload: {
          gameId: state.id
        }
      })
    }
  }
}
