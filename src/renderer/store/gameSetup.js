import Vue from 'vue'
import uniq from 'lodash/uniq'
import mapKeys from 'lodash/mapKeys'
import { v4 as uuidv4 } from 'uuid';

import { isConfigValueEnabled, getDefaultElements } from '@/models/elements'
import { getDefaultRules } from '@/models/rules'

const DEFAULT_SETS = {
  'basic': 1
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
    slots.push({ number: i, state: 'open', name: null, order: null })
  }
  return slots
}

export const state = () => ({
  sets: { ...DEFAULT_SETS },
  elements: getDefaultElements(DEFAULT_SETS),
  rules: getDefaultRules(),
  start: null,
  timer: null,
  slots: getEmptySlots()
})

export const mutations = {
  clear (state) {
    state.sets = { ...DEFAULT_SETS }
    state.elements = getDefaultElements(DEFAULT_SETS)
    state.rules = getDefaultRules()
    state.start = null
    state.timer = null
    state.slots = getEmptySlots()
  },

  setup (state, setup) {
    state.sets = setup.sets
    state.elements = setup.elements
    state.rules = setup.rules
    state.start = setup.start
    state.timer = setup.timer
  },

  tileSetQuantity (state, { id, quantity }) {
    if (isConfigValueEnabled(quantity)) {
      Vue.set(state.sets, id, quantity)
    } else {
      Vue.delete(state.sets, id)
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

  slot (state, slot) {
    Vue.set(state.slots, slot.number, slot)
  },

  slots (state, slots) {
    state.slots = slots
  },

  startingTiles (state, id) {
    state.start = id
  }
}

export const actions = {
  setTileSetQuantity ({ state, commit }, { id, quantity }) {
    const enabledStateChanged = (state.sets[id] > 0) !== (quantity > 0)
    const before = enabledStateChanged ? getDefaultElements(state.sets) : null
    commit('tileSetQuantity', { id, quantity })
    if (id === 'gq11') {
      const containsRiver = !!Object.keys(state.sets).find(id => id.startsWith('river/'))
      commit('tileSetQuantity', { id: 'gq11/river', quantity: containsRiver ? quantity : 0 })
    } else if (id.startsWith('river/') && state.sets.gq11) {
      const containsRiver = !!Object.keys(state.sets).find(id => id.startsWith('river/'))
      commit('tileSetQuantity', { id: 'gq11/river', quantity: containsRiver ? state.sets.gq11 : 0 })
    }
    const after = enabledStateChanged ? getDefaultElements(state.sets) : null

    if (enabledStateChanged) {
      const diff = getModifiedDefaults(before, after)
      Object.entries(diff).forEach(([id, config]) => {
        // use commit, not dispatch - bounded meeples (eg mage/witch) are alredy reflected in rules
        commit('elementConfig', { id, config })
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

  takeSlot ({ state, commit }, { number, name }) {
    let max = 0
    state.slots.forEach(({ order }) => {
      if (order > max) { max = order }
    })
    commit('slot', { number, state: 'local', name, order: max + 1 })
  },

  releaseSlot ({ state, commit }, { number }) {
    const { order } = state.slots[number]
    for (let i = 0; i < state.slots.length; i++) {
      if (i === number) {
        commit('slot', { number, state: 'open', name: null, order: null })
      } else {
        const slot = state.slots[i]
        if (slot.order > order) {
          commit('slot', { ...slot, number: i, order: slot.order - 1 })
        }
      }
    }
  },

  createGame ({ state, commit, getters, dispatch }) {
    const { $tiles, $server, $connection } = this._vm
    const sets = mapKeys(state.sets, (value, key) => {
      return $tiles.sets[key] ? key : key + ':' + getters.getSelectedEdition
    })

    const setup = {
      sets,
      elements: state.elements,
      rules: state.rules,
      timer: state.timer,
      start: getters.selectedStartingTiles.value
    }

    dispatch('settings/addRecentGameSetup', setup, { root: true })
    commit('game/id', uuidv4(), { root: true })
    commit('game/setup', setup, { root: true })
    $server.start(setup)
    $connection.connect()
  }
}

export const getters = {
  containsCoreSet: state => state.sets.basic || state.sets.winter,

  getSelectedEdition: state => state.elements.abbot ? 2 : 1,

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
