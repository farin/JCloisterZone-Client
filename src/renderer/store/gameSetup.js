import Vue from 'vue'
import uniq from 'lodash/uniq'
import mapKeys from 'lodash/mapKeys'

import { GameElement, isConfigValueEnabled, getDefaultElements } from '@/models/elements'
import { getDefaultRules } from '@/models/rules'
import { Expansion } from '@/models/expansions'

const DEFAULT_SETS = {
  basic: 1
}

function getModifiedDefaults (before, after) {
  const keys = uniq([...Object.keys(before), ...Object.keys(after)])
  const diff = {}
  keys.forEach(cid => {
    if (before[cid] !== after[cid]) {
      diff[cid] = after[cid]
    }
  })
  return diff
}

function getEmptySlots () {
  const slots = []
  for (let i = 0; i < 9; i++) {
    slots.push({ number: i, clientId: null, sessionId: null, name: null })
  }
  return slots
}

export const state = () => ({
  sets: { ...DEFAULT_SETS },
  excludedSets: {},
  elements: getDefaultElements(DEFAULT_SETS),
  rules: getDefaultRules(),
  start: null,
  timer: null,
  gameAnnotations: {}
})

export const mutations = {
  clear (state) {
    state.sets = { ...DEFAULT_SETS }
    state.excludedSets = {}
    state.elements = getDefaultElements(DEFAULT_SETS)
    state.rules = getDefaultRules()
    state.start = null
    state.timer = null
    state.gameAnnotations = {}
  },

  setup (state, setup) {
    state.sets = setup.sets
    state.excludedSets = setup.excludedSets
    state.elements = setup.elements
    state.rules = setup.rules
    state.start = setup.start
    state.timer = setup.timer
    state.gameAnnotations = {}
  },

  gameAnnotations (state, gameAnnotations) {
    state.gameAnnotations = gameAnnotations
  },

  tileSetQuantity (state, { id, quantity }) {
    if (isConfigValueEnabled(quantity)) {
      Vue.set(state.sets, id, quantity)
    } else {
      Vue.delete(state.sets, id)
    }
  },

  tileSetExcludedQuantity (state, { id, quantity }) {
    if (isConfigValueEnabled(quantity)) {
      Vue.set(state.excludedSets, id, quantity)
    } else {
      Vue.delete(state.excludedSets, id)
    }
  },

  elementConfig (state, { id, config }) {
    if (isConfigValueEnabled(config)) {
      Vue.set(state.elements, id, config)
    } else {
      Vue.delete(state.elements, id)
    }
  },

  ruleConfig (state, { id, config }) {
    state.rules[id] = config
  },

  timer (state, value) {
    state.timer = value
  },

  startingTiles (state, id) {
    state.start = id
  }
}

export const actions = {
  newGame ({ commit }) {
    commit('clear')
  },

  load ({ commit }, setup) {
    const { $tiles } = this._vm
    const sets = mapKeys(setup.sets, (val, key) => key.split(':')[0])
    const excludedSets = {}
    const edition = setup.elements.garden ? 2 : 1
    const expansions = $tiles.getExpansions(sets, edition)
    Object.entries(expansions).forEach(([expId, quantity]) => {
      const expansion = Expansion[expId]
      for (const release of expansion.releases) {
        release.sets.forEach(id => {
          if ($tiles.isTileSetExcluded(id, expansions, edition)) {
            excludedSets[id] = quantity
          }
        })
      }
    })

    commit('setup', {
      ...setup,
      sets,
      excludedSets
    })
  },

  setReleaseQuantity ({ state, getters, commit }, { release, quantity }) {
    const { $tiles } = this._vm
    const enabledStateChanged = (!!release.sets.find(id => !!state.sets[id])) !== (quantity > 0)
    const before = enabledStateChanged ? getDefaultElements(state.sets) : null
    release.sets.forEach(id => {
      if (state.excludedSets[id]) {
        commit('tileSetExcludedQuantity', { id, quantity })
      } else {
        commit('tileSetQuantity', { id, quantity })
      }
    })
    const edition = getters.getSelectedEdition
    const expansions = $tiles.getExpansions(state.sets, edition)
    const verifyExcluded = { ...state.excludedSets }
    Object.entries(state.sets).forEach(([id, quantity]) => {
      if ($tiles.isTileSetExcluded(id, expansions, edition)) {
        commit('tileSetQuantity', { id, quantity: 0 })
        commit('tileSetExcludedQuantity', { id, quantity })
        delete verifyExcluded[id]
      } else if (state.excludedSets[id]) {
        commit('tileSetQuantity', { id, quantity })
        commit('tileSetExcludedQuantity', { id, quantity: 0 })
      }
    })

    // and reeable no longer excluded sets
    Object.entries(verifyExcluded).forEach(([id, quantity]) => {
      if (!$tiles.isTileSetExcluded(id, expansions, edition)) {
        commit('tileSetQuantity', { id, quantity })
        commit('tileSetExcludedQuantity', { id, quantity: 0 })
      }
    })
    const after = enabledStateChanged ? getDefaultElements(state.sets) : null

    if (enabledStateChanged) {
      const diff = getModifiedDefaults(before, after)
      Object.entries(diff).forEach(([id, config]) => {
        // use commit, not dispatch - bounded meeples (eg mage/witch) are already reflected in rules
        commit('elementConfig', { id, config })
      })

      GameElement.all().forEach(ge => {
        if (ge.id in state.elements) {
          if (!ge.isEnabled(state.sets, state.elements)) {
            commit('elementConfig', { id: ge.id, config: false })
          }
        }
      })
    }
  },

  setElementConfig ({ commit }, { id, config }) {
    commit('elementConfig', { id, config })
    if (id === 'mage') {
      commit('elementConfig', { id: 'witch', config })
    } else if (id === 'witch') {
      commit('elementConfig', { id: 'mage', config })
    } else if (id === 'abbot') {
      commit('elementConfig', { id: 'garden', config })
    }
  },

  setRuleConfig ({ commit }, { id, config }) {
    commit('ruleConfig', { id, config })
  },

  takeSlot ({ rootState }, { number, name }) {
    this._vm.$connection.send({
      type: 'TAKE_SLOT',
      payload: { gameId: rootState.game.id, number, name }
    })
  },

  renameSlot ({ rootState }, { number, name }) {
    this._vm.$connection.send({
      type: 'UPDATE_SLOT',
      payload: { gameId: rootState.game.id, number, name }
    })
  },

  releaseSlot ({ rootState }, { number }) {
    this._vm.$connection.send({
      type: 'LEAVE_SLOT',
      payload: { gameId: rootState.game.id, number }
    })
  },

  createGame ({ state, commit, getters, dispatch }, loadedSetup) {
    const { $tiles } = this._vm
    let setup

    if (loadedSetup) {
      setup = {
        options: {},
        ...loadedSetup
      }
    } else {
      const sets = mapKeys(state.sets, (value, key) => {
        return $tiles.sets[key] ? key : key + ':' + getters.getSelectedEdition
      })

      setup = {
        sets,
        elements: state.elements,
        rules: state.rules,
        timer: state.timer,
        start: getters.selectedStartingTiles.value,
        options: {}
      }
    }

    dispatch('settings/addRecentGameSetup', setup, { root: true })
    dispatch('networking/startServer', {
      setup,
      slots: getEmptySlots(),
      gameAnnotations: state.gameAnnotations
    }, { root: true })
  }
}

export const getters = {
  containsCoreSet: state => state.sets.basic || state.sets.winter,

  getSelectedEdition: state => state.elements.garden ? 2 : 1,

  startingTilesOptions: (state, getters) => {
    const { sets } = state
    const river = sets['river/1'] || sets['river/2'] || sets['river/3']
    const count = !!sets.count
    const windRoses = !!sets['wind-roses']

    const countTiles = [
      { tile: 'CO/1', x: -2, y: -1, rotation: 0 },
      { tile: 'CO/2', x: -1, y: -1, rotation: 0 },
      { tile: 'CO/3', x: 0, y: -1, rotation: 0 },
      { tile: 'CO/4', x: 1, y: -1, rotation: 0 },
      { tile: 'CO/5', x: -2, y: 0, rotation: 0 },
      { tile: 'CO/6', x: -1, y: 0, rotation: 0 },
      { tile: 'CO/7', x: 0, y: 0, rotation: 0 },
      { tile: 'CO/8', x: 1, y: 0, rotation: 0 },
      { tile: 'CO/9', x: -2, y: 1, rotation: 0 },
      { tile: 'CO/10', x: -1, y: 1, rotation: 0 },
      { tile: 'CO/11', x: 0, y: 1, rotation: 0 },
      { tile: 'CO/12', x: 1, y: 1, rotation: 0 }
    ]

    const options = [
      {
        id: 'standard',
        title: 'Standard',
        value: [{ tile: 'BA/RCr', x: 0, y: 0, rotation: 0 }],
        enabled: !river && !count && !windRoses,
        default: !river && !count && !windRoses && !sets['spiel-doch']
      }, {
        id: 'wind-roses',
        title: 'The Wind Roses',
        value: [{ tile: 'WR/CFR', x: 0, y: 0, rotation: 0 }],
        enabled: !river && !count && windRoses,
        default: !river && !count && windRoses
      }, {
        id: 'spiel-doch',
        title: 'Spiel Doch Promo',
        value: [
          { tile: 'SD/CC', x: 0, y: 0, rotation: 0 },
          { tile: getters.getSelectedEdition === 1 ? 'SD/RRR' : 'SD/RRRG', x: 1, y: 0, rotation: 270 }
        ],
        enabled: !!sets['spiel-doch'] && !count && !river && !windRoses,
        default: !!sets['spiel-doch'] && !count && !river && !windRoses
      }, {
        id: 'spring',
        title: 'The River',
        value: [{ tile: 'RI/s', x: 0, y: 0, rotation: 0 }],
        enabled: river && !count && !windRoses,
        default: river && !count && !windRoses && !sets.gq11
      }, {
        id: 'spring-alt',
        title: 'GQ11 spring',
        value: [{ tile: 'GQ/RFI', x: 0, y: 0, rotation: 0 }],
        enabled: river && !count && !windRoses && sets.gq11,
        default: river && !count && !windRoses && sets.gq11
      }, {
        id: 'spring-with-wind-roses',
        title: 'The Wind Roses + The River',
        value: [
          { tile: 'WR/CFR', x: 0, y: 0, rotation: 0 },
          { tile: 'RI/s', x: 0, y: 1, rotation: 90 }
        ],
        enabled: river && !count && windRoses,
        default: river && !count && windRoses
      }, {
        id: 'count',
        title: 'The Count',
        value: countTiles,
        enabled: count && !river && !windRoses,
        default: count && !river && !windRoses
      }, {
        id: 'count-with-river',
        title: 'The Count + The River',
        value: [...countTiles, { tile: 'RI/s', x: 2, y: -1, rotation: 0 }],
        enabled: count && river && !windRoses,
        default: count && river && !windRoses
      }, {
        id: 'count-with-wind-roses',
        title: 'The Count + The Wind Roses',
        value: [...countTiles, { tile: 'WR/CFR', x: -1, y: -2, rotation: 0 }],
        enabled: count && !river && windRoses,
        default: count && !river && windRoses
      }, {
        id: 'count-with-wind-roses-and-river',
        title: 'The Count + The Wind Roses + The River',
        value: [
          ...countTiles,
          { tile: 'WR/CFR', x: -1, y: -2, rotation: 0 },
          { tile: 'RI/s', x: 2, y: -1, rotation: 0 }
        ],
        enabled: count && river && windRoses,
        default: count && river && windRoses
      }
    ]
    return options
  },

  selectedStartingTiles: (state, getters) => {
    const options = getters.startingTilesOptions
    let selected = options.find(opt => opt.enabled && state.start === opt.id)
    if (!selected) {
      selected = options.find(opt => opt.default)
    }
    return selected
  }
}
