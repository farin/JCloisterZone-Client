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

      <div class="header tiles" :title="$t('core-messages.tiles')"><v-icon>far fa-square</v-icon></div>
      <div v-for="(val, idx) in stats.tiles" :key="'tiles-'+idx" class="tiles value">
        {{ val }}
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

      <template v-if="stats.points.shrine.some(p => p)">
        <div class="header shrine" :title="$t('game.feature.shrines')"><img src="~/assets/features/C1/shrine.jpg" height="40"></div>
        <div v-for="(val, idx) in stats.points.shrine" :key="'shrine-'+idx" class="shrine value">
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

      <template v-if="stats.points.tower.some(p => p)">
        <div class="header tower" :title="$t('game.feature.towers')"><StandaloneTileImage tile-id="TO/F" :size="40" /></div>
        <div v-for="(val, idx) in stats.points.tower" :key="'tower-'+idx" class="tower value">
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

      <template v-if="stats.points.ringmaster.some(p => p)">
        <div class="header ringmaster" :title="$t('game.feature.ringmaster')">
          <Meeple type="Ringmaster" />
        </div>
        <div v-for="(val, idx) in stats.points.ringmaster" :key="'ringmaster-'+idx" class="ringmaster value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points.bigtop.some(p => p)">
        <div class="header bigtop" :title="$t('game.feature.big-top')">
          <NeutralFigure figure="big-top" :width="40" :height="40" />
        </div>
        <div v-for="(val, idx) in stats.points.bigtop" :key="'bigtop-'+idx" class="bigtop value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points.acrobats.some(p => p)">
        <div class="header bigtop" :title="$t('game.feature.acrobats')">
          <svg class="meeple" width="40" height="40">
            <g transform="scale(0.40)">
              <use :href="`${MEEPLES_SVG}#small-follower`" x="22" y="0" />
              <use :href="`${MEEPLES_SVG}#small-follower`" x="-1" y="41" />
              <use :href="`${MEEPLES_SVG}#small-follower`" x="46" y="41" />
            </g>
          </svg>
        </div>
        <div v-for="(val, idx) in stats.points.bigtop" :key="'acrobats-'+idx" class="bigtop value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points['wind-rose'].some(p => p)">
        <div class="header wind-rose" :title="$t('game.feature.wind-roses')"><StandaloneTileImage tile-id="WR/Rr" :size="40" /></div>
        <div v-for="(val, idx) in stats.points['wind-rose']" :key="'special-monasteries-'+idx" class="wind-rose value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points['church'].some(p => p)">
        <div class="header yaga-hut" :title="$t('game.feature.church-bonus')"><StandaloneTileImage tile-id="DA/LRRRR" :size="40" /></div>
        <div v-for="(val, idx) in stats.points['church']" :key="'church-'+idx" class="church value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points['yaga-hut'].some(p => p)">
        <div class="header yaga-hut" :title="$t('game.feature.yaga-hut')"><StandaloneTileImage tile-id="RU/L" :size="40" /></div>
        <div v-for="(val, idx) in stats.points['yaga-hut']" :key="'yaga-hut-'+idx" class="yaga-hut value">
          {{ val }}
        </div>
      </template>

      <template v-if="stats.points.vodyanoy.some(p => p)">
        <div class="header vodyanoy" :title="$t('game.feature.vodyanoy')"><StandaloneTileImage tile-id="RU/V" :size="40" /></div>
        <div v-for="(val, idx) in stats.points.vodyanoy" :key="'vodyanoy-'+idx" class="vodyanoy value">
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

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  components: {
    Meeple,
    NeutralFigure,
    StandaloneTileImage,
    TokenImage,
  },

  data () {
    return {
      MEEPLES_SVG,
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
          'tower': (new Array(this.players.length)).fill(0),
          'flock': (new Array(this.players.length)).fill(0),
          'ringmaster': (new Array(this.players.length)).fill(0),
          'bigtop': (new Array(this.players.length)).fill(0),
          'acrobats': (new Array(this.players.length)).fill(0),
          'shrine': (new Array(this.players.length)).fill(0),
          'wind-rose': (new Array(this.players.length)).fill(0),
          'church': (new Array(this.players.length)).fill(0),
          'yaga-hut': (new Array(this.players.length)).fill(0),
          'vodyanoy': (new Array(this.players.length)).fill(0)
        }
      }
      this.history.forEach(h => {
        h.events.forEach(ev => {
          if (ev.type === 'tile-placed') {
            const idx = this.players.findIndex(p => p.index === h.player)
            stats.tiles[idx] += 1
          } else if (ev.type === 'ransom-paid') {
          console.log(ev.jailer,ev.prisoner,stats.tower);
            const jailerIdx = this.players.findIndex(p => p.index === ev.jailer)
            stats.points.tower[jailerIdx] += 3
            const prisonerIdx = this.players.findIndex(p => p.index === ev.prisoner)
            stats.points.tower[prisonerIdx] -= 3
          } else if (ev.type === 'points') {
            ev.points.forEach(({ name, player, points }) => {
              console.log(name,points);
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

    .header
      svg.meeple, svg.neutral
        +theme using ($theme)
          fill: map-get($theme, 'gray-text-color')

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

.header.tiles
  .v-icon
    font-size: 45px

.header.traders, .header.gold
  margin: 10px 0

#app.theme--dark .header img.bw
  filter: invert(1)
</style>
