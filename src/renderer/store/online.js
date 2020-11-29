
export const state = () => ({
  gameList: []
})

export const mutations = {
  gameList (state, value) {
    state.gameList = value
  }
}

export const actions = {
  onClose ({ commit }) {
    commit('gameList', [])
  },

  gameUpdate ({ state, commit }, payload) {
    console.log('TODO handle GAME_UPDATE', payload)
  }
}
