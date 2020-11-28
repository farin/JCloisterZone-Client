
export const state = () => ({
  channel: null
})

export const mutations = {
  channel (state, value) {
    state.channel = value
  }
}

export const actions = {
  onClose ({ commit }) {
    commit('channel', null)
  },

  gameUpdate ({ state, commit }, payload) {
    console.log('TODO handle GAME_UPDATE', payload)
  }
}
