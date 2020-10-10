<template>
  <section>
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
      ranks: state => {
        const playersWithIndex = state.game.players.map((p, index) => ({ ...p, index }))
        const groups = groupBy(playersWithIndex, 'points')
        const points = Object.keys(groups).map(p => parseInt(p))
        points.sort()
        points.reverse()
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
  }
}
</script>

<style lang="sass" scoped>
section
  display: flex
  justify-content: center
  align-items: center

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
