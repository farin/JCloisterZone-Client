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
      <v-btn large color="secondary" @click="toggleStats">
        <v-icon left>fa-chart-bar</v-icon>
        {{ showGameStats ? 'Hide Stats' : 'Show Stats' }}
      </v-btn>
      <v-btn large color="secondary" @click="playAgain">
        <v-icon left>fas fa-play</v-icon>
        Play Again
      </v-btn>
      <v-btn large color="secondary" @click="close">
        <v-icon left>fa-times</v-icon>
        Close
      </v-btn>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import Meeple from '@/components/game/Meeple'

export default {
  components: {
    Meeple
  },

  computed: {
    ...mapState({
      showGameStats: state => state.game.showGameStats,
      onlineConnected: state => state.networking.connectionType === 'online'
    }),

    ...mapGetters({
      colorCssClass: 'game/colorCssClass',
      ranks: 'game/ranks'
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
    },

    toggleStats () {
      this.$store.commit('game/showGameStats', !this.showGameStats)
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
