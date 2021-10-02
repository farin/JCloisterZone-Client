<template>
  <section>
    <div class="standing">
      <div
        v-for="r in ranks"
        :key="r.rank"
        class="rank"
      >
        <div class="num">{{ r.rank }}</div>
        <div
          v-for="p in r.players"
          :key="p.index"
          :class="colorCssClass(p.index)"
        >
          <Meeple type="SmallFollower" />
        </div>
      </div>
    </div>

    <div class="buttons">
      <v-btn large color="secondary" @click="close">
        <v-icon left>fa-times</v-icon>
        Close
      </v-btn>
      <v-btn large color="secondary" @click="playAgain">
        <v-icon left>fas fa-play</v-icon>
        Play Again
      </v-btn>
    </div>
  </section>
</template>

<script>
import groupBy from 'lodash/groupBy'

import { mapGetters, mapState } from 'vuex'
import Meeple from '@/components/game/Meeple'

export default {
  components: {
    Meeple
  },

  computed: {
    ...mapState({
      onlineConnected: state => state.networking.connectionType === 'online',
      ranks: state => {
        const playersWithIndex = state.game.players.map((p, index) => ({ ...p, index }))
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
    }),

    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    })
  },

  methods: {
    async close () {
      if (this.onlineConnected) {
        this.$router.push('/online')
      } else {
        this.$store.dispatch('game/close')
        this.$router.push('/')
      }
    },

    async playAgain () {
      const { setup, gameAnnotations } = this.$store.state.game
      await this.$store.dispatch('game/close')
      this.$store.dispatch('gameSetup/load', setup)
      this.$store.commit('gameSetup/gameAnnotations', gameAnnotations)
      await this.$store.dispatch('gameSetup/createGame')
    }
  }
}
</script>

<style lang="sass" scoped>
section
  display: flex

.standing
  padding-top: 20px
  flex-grow: 1
  display: flex
  justify-content: center
  align-items: center

.buttons
  display: flex
  justify-content: center
  align-items: center
  padding-right: 20px

  .v-btn
    margin-left: 10px

svg.meeple
  width: 55px
  height: 55px

.rank
  display: flex
  margin: 0 35px

  .num
    position: relative
    top: -8px
    font-weight: 900
    font-size: 48px
    margin-right: 10px

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')

</style>
