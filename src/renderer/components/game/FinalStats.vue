<template>
  <div
    class="final-stats"
    :style="`width: ${60 + players.length * 200}px`"
  >
    <div
      class="grid"
      :style="`grid-template-columns: 60px repeat(${players.length}, 1fr)`"
    >
      <div />
      <div v-for="p in players" :key="'rank-'+p.index" class="rank">
        {{ p.rank }}
      </div>

      <div />
      <div
        v-for="p in players"
        :key="'ico-'+p.index"
        :class="colorCssClass(p.index)"
      >
        <Meeple type="SmallFollower" />
      </div>

      <div />
      <div v-for="p in players" :key="'name-'+p.index" class="name">
        {{ p.name }}
      </div>

      <div />
      <div v-for="p in players" :key="'points-'+p.index" class="points" :class="colorCssClass(p.index)">
        <div>
          {{ p.points }}
        </div>
      </div>

      <div class="header"><v-icon title="Tiles">fas fa-square</v-icon></div>
      <div v-for="(val, idx) in stats.tiles" :key="'tiles-'+idx" class="tiles">
        {{ val }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import flatten from 'lodash/flatten'

import Meeple from '@/components/game/Meeple'

export default {
  components: {
    Meeple
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass',
      ranks: 'game/ranks'
    }),

    ...mapState({
      history: state => state.game.history
    }),

    players () {
      return flatten(this.ranks.map(r => r.players.map(p => ({ ...p, rank: r.rank }))))
    },

    stats () {
      const stats = {
        tiles: (new Array(this.players.length)).fill(0)
      }
      this.history.forEach(h => {
        const idx = this.players.findIndex(p => p.index === h.player)
        h.events.forEach(ev => {
          if (ev.type === 'tile-placed') {
            stats.tiles[idx] += 1
          }
        })
      })
      console.log(stats)
      return stats
    }
  }
}
</script>

<style lang="sass" scoped>
.final-stats
  --top: calc(var(--action-bar-height) + #{$panel-gap})
  position: absolute
  top: var(--top)
  right: calc(var(--aside-width) + #{$panel-gap})
  bottom: $panel-gap
  user-select: none
  //height: calc(100vh - var(--top))

  font-size: 20px

  +theme using ($theme)
    background: map-get($theme, 'opaque-bg')

  .grid
    display: grid
    justify-content: center
    justify-items: center
    align-items: center

svg.meeple
  width: 40px
  height: 40px
  margin-bottom: -4px

.header
  justify-self: end

  .v-icon
    font-size: 36px

.rank
  font-weight: 900
  font-size: 48px
  margin: 10px 0

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')

.name
  margin-bottom: 4px
  font-size: 16px
  text-overflow: ellipsis

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')

.points
  border-radius: 20px
  width: 76px
  margin: 10px 0 20px

  > div
    font-size: 26px
    text-align: center
    font-weight: 500

</style>
