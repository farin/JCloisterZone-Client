import Vue from 'vue'
import uniq from 'lodash/uniq'
import mapKeys from 'lodash/mapKeys'

import { GameElement, isConfigValueEnabled } from '@/models/elements'
import { Rule, getDefaultRules } from '@/models/rules'
import { Expansion } from '@/models/expansions'
import { getSelectedEdition, getSelectedStartingTiles, getStartingTilesOptions } from '@/utils/gameSetupUtils'

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
  sets: null,
  excludedSets: {},
  elements: null,
  rules: null,
  start: null,
  timer: null,
  gameAnnotations: {}
})

export const mutations = {
  clear (state) {
    const { $tiles } = this._vm
    state.sets = { ...DEFAULT_SETS }
    state.excludedSets = {}
    state.elements = $tiles.getDefaultElements(DEFAULT_SETS)
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
      rules: { ...getDefaultRules(), ...setup.rules },
      sets,
      excludedSets
    })
  },

  setReleaseQuantity ({ state, getters, commit }, { release, quantity }) {
    const { $tiles } = this._vm
    const enabledStateChanged = (!!release.sets.find(id => !!state.sets[id])) !== (quantity > 0)
    const before = enabledStateChanged ? $tiles.getDefaultElements(state.sets) : null
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
    const after = enabledStateChanged ? $tiles.getDefaultElements(state.sets) : null

    if (enabledStateChanged) {
      const diff = getModifiedDefaults(before, after)
      Object.entries(diff).forEach(([id, config]) => {
        // use commit, not dispatch - bound meeples (eg mage/witch) are already reflected in rules
        commit('elementConfig', { id, config })
      })

      GameElement.all().forEach(ge => {
        if (ge.id in state.elements) {
          if (!$tiles.isElementEnabled(ge, state.sets, state.elements)) {
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
      const edition = getters.getSelectedEdition
      const sets = mapKeys(state.sets, (value, key) => {
        return $tiles.sets[key] ? key : key + ':' + edition
      })
      const addons = {}
      Object.keys($tiles.getExpansions(sets, edition)).forEach(id => {
        const { addon } = Expansion[id]
        if (addon) {
          addons[addon.id] = addon.json.version
        }
      })

      setup = {
        sets,
        elements: state.elements,
        rules: state.rules,
        timer: state.timer,
        start: getters.selectedStartingTiles.value,
        options: {}
      }

      if (Object.keys(addons).length) {
        setup.addons = addons
      }
    }

    const rules = {}
    Rule.all().forEach(r => {
      if (r.isAvailable($tiles, setup)) {
        const val = state.rules[r.id]
        rules[r.id] = val === undefined ? r.default : val
      }
    })
    setup.rules = rules

    dispatch('networking/startServer', {
      setup,
      slots: getEmptySlots(),
      gameAnnotations: state.gameAnnotations
    }, { root: true })
  }
}

export const getters = {
  getSelectedEdition: state => getSelectedEdition(state.elements),
  startingTilesOptions: state => getStartingTilesOptions(state.elements, state.sets),
  selectedStartingTiles: state => getSelectedStartingTiles(state.elements, state.sets, state.start)
}
