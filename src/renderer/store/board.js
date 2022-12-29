import Vue from 'vue'

const DEFAULT_ZOOM = 0.18

export const state = () => ({
  dragging: null,
  pointsExpression: null,
  layers: {},
  tilePlacementMouseOver: null, // select tile from TilePlacementLayer must be drawn together with regular tils by TileLayer
  zoom: DEFAULT_ZOOM
})

const delayedHideTimeout = {}

export const mutations = {
  dragging (state, value) {
    state.dragging = value
  },

  pointsExpression (state, value) {
    state.pointsExpression = value
  },

  showLayer (state, { layer, props }) {
    const { layers } = state
    if (!layers[layer]) {
      Vue.set(layers, layer, props)
    } else {
      // update it reactive
      Object.entries(props).forEach(([key, value]) => {
        Vue.set(layers[layer], key, value)
      })
      Object.keys(layers[layer]).forEach(key => {
        if (props[key] === undefined) {
          Vue.delete(layers[layer], key)
        }
      })
    }
  },

  hideLayer (state, { layer }) {
    Vue.delete(state.layers, layer)
  },

  tilePlacementMouseOver (state, value) {
    state.tilePlacementMouseOver = value
  },

  resetZoom (state) {
    state.zoom = DEFAULT_ZOOM
  },

  changeZoom (state, steps) {
    let zoom = state.zoom * (1.3 ** steps)
    if (zoom < 0.03) { zoom = 0.03 };
    if (zoom > 0.4) { zoom = 0.4 };
    state.zoom = zoom
  },

  reset (state) {
    state.dragging = null
    state.pointsExpression = null
    state.layers = {}
    state.tilePlacementMouseOver = null
    state.zoom = DEFAULT_ZOOM
  }
}

export const getters = {
  isDragging: state => evClick => {
    if (!state.dragging) {
      return false
    }
    const changeX = evClick.screenX - state.dragging.x
    const changeY = evClick.screenY - state.dragging.y
    return Math.abs(changeX) > 5 || Math.abs(changeY) > 5
  },

  bounds: (state, getters, rootState) => {
    const bx = [0, 0]
    const by = [0, 0]
    if (rootState.game.placedTiles) {
      rootState.game.placedTiles.forEach(({ position: [x, y] }) => {
        bx[0] = Math.min(bx[0], x)
        bx[1] = Math.max(bx[1], x)
        by[0] = Math.min(by[0], y)
        by[1] = Math.max(by[1], y)
      })
    }
    return {
      x: bx[0],
      y: by[0],
      width: bx[1] - bx[0] + 1,
      height: by[1] - by[0] + 1
    }
  }
}

export const actions = {
  showLayer ({ commit }, { layer, props }) {
    if (delayedHideTimeout[layer]) {
      clearTimeout(delayedHideTimeout[layer])
      delete delayedHideTimeout[layer]
    }
    commit('showLayer', { layer, props })
  },

  hideLayer ({ commit }, { layer }) {
    if (delayedHideTimeout[layer]) {
      clearTimeout(delayedHideTimeout[layer])
      delete delayedHideTimeout[layer]
    }
    commit('hideLayer', { layer })
  },

  hideLayerDebounced ({ dispatch }, { layer }) {
    if (!delayedHideTimeout[layer]) {
      delayedHideTimeout[layer] = setTimeout(() => {
        delete delayedHideTimeout[layer]
        dispatch('hideLayer', { layer })
      }, 50)
    }
  }
}
