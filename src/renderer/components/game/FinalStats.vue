<template>
  <div
    class="final-stats"
  >
    <div
      class="grid"
      :style="`width: ${width}px; grid-template-columns: 60px repeat(${players.length}, 1fr)`"
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

      <!-- <div class="header" :title="$t('core-messages.used-time')"><v-icon>fa-stopwatch</v-icon></div>
      <div v-for="(val, idx) in stats.clock" :key="'clock-'+idx" class="clock value">
        {{ val }}
      </div> -->

      <div class="header" :title="$t('core-messages.tiles')"><v-icon>fas fa-square</v-icon></div>
      <div v-for="(val, idx) in stats.tiles" :key="'tiles-'+idx" class="tiles value">
        {{ val }}
      </div>

      <div class="header roads" :title="$t('game.feature.roads')"><StandaloneTileImage tile-id="BA/RFr" :size="40" /></div>
      <div v-for="(val, idx) in stats.points.road" :key="'roads-'+idx" class="roads value">
        {{ val }}
      </div>

      <div class="header cities" :title="$t('game.feature.cities')"><StandaloneTileImage tile-id="BA/Cccc+" :size="40" /></div>
      <div v-for="(val, idx) in stats.points.city" :key="'cities-'+idx" class="cities value">
        {{ val }}
      </div>

      <div class="header monasteries" :title="$t('game.feature.monasteries')"><img src="~/assets/features/C1/cloister.png" height="40"></div>
      <div v-for="(val, idx) in stats.points.monastery" :key="'monasteries-'+idx" class="monasteries value">
        {{ val }}
      </div>

      <div class="header garden" :title="$t('game.feature.gardens')"><img src="~/assets/features/C1/garden.png" height="40"></div>
      <div v-for="(val, idx) in stats.points.garden" :key="'garden-'+idx" class="garden value">
        {{ val }}
      </div>

      <div class="header fields" :title="$t('game.feature.fields')"><StandaloneTileImage tile-id="GQ/F" :size="40" /></div>
      <div v-for="(val, idx) in stats.points.field" :key="'fields-'+idx" class="fields value">
        {{ val }}
      </div>

      <template v-if="stats.points['special-monastery'].some(p => p)">
        <div class="header special-monasteries" :title="$t('game.feature.special-monasteries')"><StandaloneTileImage tile-id="MO/M1" :size="40" /></div>
        <div v-for="(val, idx) in stats.points['special-monastery']" :key="'special-monasteries-'+idx" class="special-monasteries value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points.castle.some(p => p)">
        <div class="header castle" :title="$t('game.feature.castles')"><img src="~/assets/figures/castle.png" height="40"></div>
        <div v-for="(val, idx) in stats.points.castle" :key="'castles-'+idx" class="castles value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points.watchtower.some(p => p)">
        <div class="header watchtowers" :title="$t('game.feature.watchtowers')"><StandaloneTileImage tile-id="WT/CFff_3C" :size="40" /></div>
        <div v-for="(val, idx) in stats.points.watchtower" :key="'watchtowers-'+idx" class="watchtowers value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points['trade-goods'].some(p => p)">
        <div class="header traders" :title="$t('game.feature.trade-goods')"><img src="~/assets/figures/trade.png" height="20"></div>
        <div v-for="(val, idx) in stats.points['trade-goods']" :key="'traders-'+idx" class="traders value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points.king.some(p => p)">
        <div class="header king" :title="$t('core-messages.the-biggest-city')"><img src="~/assets/figures/king.png" height="40"></div>
        <div v-for="(val, idx) in stats.points.king" :key="'king-'+idx" class="king value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points.robber.some(p => p)">
        <div class="header robber" :title="$t('core-messages.the-longest-road')"><img src="~/assets/figures/robber.png" height="40"></div>
        <div v-for="(val, idx) in stats.points.robber" :key="'robber-'+idx" class="robber value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points.gold.some(p => p)">
        <div class="header gold" :title="$t('game.feature.gold')"><img src="~/assets/figures/gold.png" height="20"></div>
        <div v-for="(val, idx) in stats.points.gold" :key="'gold-'+idx" class="gold value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points.fairy.some(p => p)">
        <div class="header fairy" :title="$t('game.feature.fairy')"><NeutralFigure figure="fairy" :width="40" :height="40" /></div>
        <div v-for="(val, idx) in stats.points.fairy" :key="'fairy-'+idx" class="fairy value">
          {{ val }}
        </div> 
      </template>

      <template v-if="stats.points.flock.some(p => p)">
        <div class="header sheep" :title="$t('game.feature.sheep')">
          <TokenImage token="SHEEP_3X" :height="40" />
        </div>
        <div v-for="(val, idx) in stats.points.flock" :key="'flock-'+idx" class="sheep value">
          {{ val }}
        </div>
      </template>

    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import flatten from 'lodash/flatten'
import debounce from 'lodash/debounce'

import Meeple from '@/components/game/Meeple'
import NeutralFigure from '@/components/game/NeutralFigure'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'
import TokenImage from '@/components/game/TokenImage'

export default {
  components: {
    Meeple,
    NeutralFigure,
    StandaloneTileImage,
    TokenImage
  },

  data () {
    return {
      width: 0
    }
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
        clock: (new Array(this.players.length)).fill('0:00'),
        tiles: (new Array(this.players.length)).fill(0),
        points: {
          'road': (new Array(this.players.length)).fill(0),
          'city': (new Array(this.players.length)).fill(0),
          'monastery': (new Array(this.players.length)).fill(0),
          'garden': (new Array(this.players.length)).fill(0),
          'field': (new Array(this.players.length)).fill(0),
          'special-monastery': (new Array(this.players.length)).fill(0),
          'castle': (new Array(this.players.length)).fill(0),
          'watchtower': (new Array(this.players.length)).fill(0),
          'trade-goods': (new Array(this.players.length)).fill(0),
          'robber': (new Array(this.players.length)).fill(0),
          'king': (new Array(this.players.length)).fill(0),
          'gold': (new Array(this.players.length)).fill(0),
          'fairy': (new Array(this.players.length)).fill(0),
          'flock': (new Array(this.players.length)).fill(0)
        }
      }
      this.history.forEach(h => {
        h.events.forEach(ev => {
          if (ev.type === 'tile-placed') {
            const idx = this.players.findIndex(p => p.index === h.player)
            stats.tiles[idx] += 1
          } else if (ev.type === 'points') {
            ev.points.forEach(({ name, player, points }) => {
              const cat = name.split('.')[0]
              const idx = this.players.findIndex(p => p.index === player)
              if (stats.points[cat]) {
                stats.points[cat][idx] += points
              } else {
                // empty
                // console.log(name, points)
              }
            })
          }
        })
      })
      // console.log(stats)
      return stats
    }
  },

  mounted () {
    const computeWidth = () => {
      const { width: parentWidth } = this.$parent.$el.getBoundingClientRect()
      const asideWidth = parseInt(getComputedStyle(document.body).getPropertyValue('--aside-width-plus-gap'), 10)
      const maxWidth = parentWidth - asideWidth - 40 // 40px for padding
      const width = 60 + this.players.length * 200
      this.width = Math.min(maxWidth, width)
    }
    computeWidth()

    this.resizeObserver = new ResizeObserver(debounce(entries => {
      computeWidth()
    }), 1000)
    this.resizeObserver.observe(this.$parent.$el)
  },

  beforeDestroy () {
    this.resizeObserver.disconnect()
  }
}
</script>

<style lang="sass" scoped>
.final-stats
  --top: calc(var(--action-bar-height) + #{$panel-gap})
  position: absolute
  top: var(--top)
  right: var(--aside-width-plus-gap)
  bottom: $panel-gap
  user-select: none
  overflow: auto

  font-size: 20px
  padding: 5px 20px

  +theme using ($theme)
    background: map-get($theme, 'opaque-bg')

  .grid
    display: grid
    justify-content: center
    justify-items: center
    align-items: center
    grid-gap: 5px 0

svg.meeple
  width: 40px
  height: 40px
  margin-bottom: -9px

  .v-icon
    font-size: 36px

.rank
  font-weight: 900
  font-size: 48px
  margin: 10px 0 5px

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')

.name
  font-size: 16px
  text-overflow: ellipsis

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')

.points
  border-radius: 20px
  width: 76px
  margin: 5px 0 10px

  > div
    font-size: 26px
    text-align: center
    font-weight: 500

.roads
  margin-top: 20px

.header.traders, .header.gold
  margin: 10px 0

#app.theme--dark .header img.bw
  filter: invert(1)
</style>
