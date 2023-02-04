<template>
  <g :id="'meeple-layer' + (deployedOnBridge ? '-bridges' : '')">
    <!--
      MeepleSelectLayer is just virtual layer used from this class
      because selection operates with meeple positions and position change if meeples are stacked
      it's easier handle all at same place
    -->
    <g
      v-for="meeple in barns"
      :key="meeple.id"
      :transform="transformPosition(meeple.position)"
      :class="colorCssClass(meeple.player)"
    >
      <use
        class="meeple"
        :x="-MEEPLE_SIZE / 2"
        :y="-MEEPLE_SIZE / 2"
        :width="MEEPLE_SIZE"
        :height="MEEPLE_SIZE"
        :href="`${MEEPLES_SVG}#barn`"
      />
    </g>

    <g
      v-for="group in meeples"
      :key="group.id"
      :transform="(group.customTransform ? group.customTransform : transformPoint(group)) + ` ` + rotateMeeple()"
    >
      <g
        v-for="meeple in group.meeples"
        :key="meeple.id"
        :transform="`translate(${meeple.x} ${meeple.y})`"
        :class="colorCssClass(meeple.player)"
      >
        <FlockDetail
          v-if="meeple.type === 'Shepherd'"
          :meeple="meeple"
          :transform="`translate(${BASE_SIZE * 0.13} -${BASE_SIZE * 0.13})`"
        />
        <use
          :class="{meeple: true, 'rot-90': meeple.rotate90}"
          :x="-MEEPLE_SIZE / 2"
          :y="-MEEPLE_SIZE / 2"
          :width="MEEPLE_SIZE"
          :height="MEEPLE_SIZE"
          :href="`${MEEPLES_SVG}#${svgMeepleId(meeple)}`"
          @mouseenter="onMouseOver(meeple.selectable)"
          @mouseleave="onMouseLeave()"
          @click="ev => onSelect(ev, meeple.selectable)"
        />
        <g
          v-if="meeple.selectable"
          :class="meepleSelect.css || 'meeple-select'"
        >
          <circle
            cx="0"
            cy="0"
            :r="BASE_SIZE * 0.27"
            :class="{'color-stroke': true, mouseover: mouseOver === meeple.selectable }"
            :style="{'pointer-events': 'none'}"
            fill="none"
            :stroke-width="BASE_SIZE * 0.07"
          />

          <!--
            invisible shape for tracking mouse events
            use only if single meeple is on the spot
          -->
          <circle
            v-if="group.meeples.length === 1"
            cx="0"
            cy="0"
            :r="BASE_SIZE * 0.305"
            :style="{'pointer-events': 'all', fill: 'none'}"
            @mouseenter="meepleSelect.local && onMouseOver(meeple.selectable)"
            @mouseleave="meepleSelect.local && onMouseLeave(meeple.selectable)"
            @click="ev => meepleSelect.local && onSelect(ev, meeple.selectable)"
          />
        </g>

        <use
          v-if="fairy && fairy.placement.meepleId === meeple.id"
          class="fairy"
          :x="-BASE_SIZE * 0.1"
          :y="-BASE_SIZE * 0.24"
          :width="BASE_SIZE * 0.42"
          :height="BASE_SIZE * 0.42"
          :href="`${NEUTRAL_SVG}#fairy`"
        />
      </g>

      <g
        v-for="n in group.neutral"
        :key="n.type"
        :transform="`translate(${n.x} ${n.y})`"
        :class="n.type"
      >
        <use
          :width="BASE_SIZE * 0.42"
          :height="BASE_SIZE * 0.42"
          :x="-BASE_SIZE * 0.21"
          :y="-BASE_SIZE * 0.21"
          :href="`${NEUTRAL_SVG}#${n.type === 'bigtop' ? 'big-top' : n.type}`"
        />
      </g>
    </g>

    <!-- and netutral figures -->
    <g v-if="dragon">
      <polyline
        v-if="dragon.visited && dragon.visited.length"
        :points="dragonVisitedPoints"
        fill="none"
        stroke="#7a172d"
        :stroke-width="BASE_SIZE * 0.12"
        stroke-opacity="0.7"
      />

      <g
        :transform="transformPosition(dragon.position)"
        class="dragon"
      >
        <use
          :width="BASE_SIZE * 0.95"
          :height="BASE_SIZE * 0.475"
          :x="BASE_SIZE * 0.025"
          :y="BASE_SIZE * 0.25"
          :href="`${NEUTRAL_SVG}#dragon`"
        />
      </g>
    </g>

    <!--
        even if meepleId is null, fairy still can be placed on feature.
        this happen when meeple is returned and fairy is no longer bound to it
    -->
    <g
      v-if="fairy && !fairy.placement.meepleId"
      :transform="lonelyFairyTransform()"
      class="fairy"
    >
      <use
        :width="BASE_SIZE * 0.42"
        :height="BASE_SIZE * 0.42"
        :href="`${NEUTRAL_SVG}#fairy`"
      />
    </g>
  </g>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import groupBy from 'lodash/groupBy'
import keyBy from 'lodash/keyBy'
import kebabCase from 'lodash/kebabCase'

import { isSameFeature } from '@/utils/gameUtils'
import FlockDetail from '@/components/game/layers/FlockDetail'
import LayerMixin from '@/components/game/layers/LayerMixin'

import { BASE_SIZE } from '@/constants/ui'
import { FOLLOWER_ORDERING } from '@/constants/ordering'

const MEEPLES_SVG = require('~/assets/meeples.svg')
const NEUTRAL_SVG = require('~/assets/neutral.svg')
const NEUTRAL_FIGURES = ['count', 'mage', 'witch', 'bigtop']

export default {
  components: {
    FlockDetail
  },

  mixins: [LayerMixin],

  props: {
    deployedOnBridge: { type: Boolean, default: false }
  },

  data () {
    return {
      MEEPLES_SVG,
      NEUTRAL_SVG,
      BASE_SIZE,
      MEEPLE_SIZE: BASE_SIZE * 0.32,
      mouseOver: null
    }
  },

  computed: {
    ...mapState({
      castles: state => state.game.features.filter(f => f.type === 'Castle'),
      dragon: state => state.game.neutralFigures.dragon,
      fairy: state => state.game.neutralFigures.fairy,
      count: state => state.game.neutralFigures.count,
      mage: state => state.game.neutralFigures.mage,
      witch: state => state.game.neutralFigures.witch,
      bigtop: state => {
        const bt = state.game.neutralFigures.bigtop
        return bt ? { placement: { position: bt.placement, feature: 'Circus', location: 'I' } } : null
      },
      meepleSelect: state => state.board.layers.MeepleSelectLayer,
      rotate: state => state.board.rotate
    }),

    ...mapGetters({
      isDeployedOnBridge: 'game/isDeployedOnBridge'
    }),

    barns () {
      if (this.deployedOnBridge) {
        return []
      }
      return this.$store.state.game.deployedMeeples.filter(m => m.type === 'Barn')
    },

    meeples () {
      const getGroupKey = ptr => {
        return `${ptr.position[0]},${ptr.position[1]},${ptr.feature}/${ptr.location}`
      }

      const castlePlaces = {}
      this.castles.forEach(c => {
        castlePlaces[this.pointerAsKey(c.places[0])] = c
        castlePlaces[this.pointerAsKey(c.places[1])] = c
      })

      const selectable = this.meepleSelect ? keyBy(this.meepleSelect.options, 'meepleId') : null
      const filtered = this.$store.state.game.deployedMeeples.filter(m => m.type !== 'Barn' && !this.isDeployedOnBridge(m) ^ this.deployedOnBridge)
      const groupped = groupBy(filtered, getGroupKey)
      const neutralInGroup = {}
      const groups = Object.entries(groupped).map(([key, meeples]) => {
        meeples.sort((a, b) => {
          if (this.fairy) {
            if (this.fairy.placement.meepleId === a.id) {
              return 1
            }
            if (this.fairy.placement.meepleId === b.id) {
              return -1
            }
          }
          return FOLLOWER_ORDERING[a.type] - FOLLOWER_ORDERING[b.type]
        })

        let x = 0
        let y = 0
        const sample = meeples[0]
        const deployedOnFarm = sample.feature === 'Field'

        const castle = castlePlaces[this.pointerAsKey(sample)]
        const group = {
          key,
          customTransform: castle ? this.getCastleTransformation(castle, sample.position) : null,
          position: sample.position,
          feature: sample.feature,
          location: sample.location,
          meeples: meeples.map(m => {
            const mapped = {
              ...m,
              x,
              y,
              rotate90: m.location === 'AS_ABBOT' || (deployedOnFarm && !['Shepherd', 'Pig'].includes(m.type)),
              selectable: selectable && selectable[m.id]
            }
            x += m.type === 'SmallFollower' ? BASE_SIZE * 0.1 : BASE_SIZE * 0.14
            y += BASE_SIZE * 0.02
            return mapped
          }),
          neutral: []
        }

        if (this.fairy && meeples.find(m => m.id === this.fairy.placement.meepleId)) {
          x += BASE_SIZE * 0.14
          y += BASE_SIZE * 0.02
        }

        NEUTRAL_FIGURES.forEach(figure => {
          if (!this[figure]) {
            return
          }
          const { placement } = this[figure]
          if (isSameFeature(placement, sample) && !(this.isDeployedOnBridge(placement) ^ this.deployedOnBridge)) {
            neutralInGroup[figure] = true
            group.neutral.push({ type: figure, x, y })
            x += BASE_SIZE * 0.14
            y += BASE_SIZE * 0.02
          }
        })
        return group
      })

      NEUTRAL_FIGURES.forEach(figure => {
        if (this[figure] && !neutralInGroup[figure]) {
          const { placement } = this[figure]
          if (!this.isDeployedOnBridge(placement) ^ this.deployedOnBridge) {
            groups.push({
              key: getGroupKey(placement),
              ...placement,
              meeples: [],
              neutral: [{ type: figure, x: 0, y: 0 }]
            })
          }
        }
      })

      return groups
    },

    dragonVisitedPoints () {
      const { visited, position } = this.dragon
      if (!visited || !visited.length) {
        return null
      }
      const points = []
      visited.forEach(pos => {
        const x = BASE_SIZE / 2 + pos[0] * BASE_SIZE
        const y = BASE_SIZE / 2 + pos[1] * BASE_SIZE
        points.push(`${x},${y}`)
      })
      const last = visited[visited.length - 1]
      let x = BASE_SIZE / 2 + position[0] * BASE_SIZE
      let y = BASE_SIZE / 2 + position[1] * BASE_SIZE
      if (position[0] !== last[0]) {
        x -= Math.sign(position[0] - last[0]) * BASE_SIZE * 0.6
      }
      if (position[1] !== last[1]) {
        y -= Math.sign(position[1] - last[1]) * BASE_SIZE * 0.3
      }
      points.push(`${x},${y}`)
      return points.join(' ')
    }
  },

  watch: {
    meepleSelect (val) {
      this.mouseOver = null
    }
  },

  methods: {
    svgMeepleId (meeple) {
      return kebabCase(meeple.type)
    },

    // methods related to meeple select

    onMouseOver (opt) {
      if (opt) {
        this.mouseOver = opt
      }
    },

    onMouseLeave () {
      this.mouseOver = null
    },

    onSelect (ev, opt) {
      if (opt && !this.isDragging(ev)) {
        this.$root.$emit('meeple.select', opt)
      }
    },

    lonelyFairyTransform () {
      const { placement } = this.fairy
      if (this.$store.state.game.setup.rules['fairy-placement'] === 'next-follower') {
        const fp = placement.featurePointer
        return this.transformPoint(fp) + ` translate(-${BASE_SIZE * 0.24} -${BASE_SIZE * 0.24})`
      } else {
        return this.transformPosition(placement) + ` translate(${BASE_SIZE * 0.41} ${BASE_SIZE * 0.2})`
      }
    },

    getCastleTransformation ({ places }, position) {
      let t
      if (places[0][0] === places[1][0]) { /// compare X
        // vertical
        const upperY = Math.min(places[0][1], places[1][1])
        t = position[1] === upperY ? `translate(${BASE_SIZE / 2} ${BASE_SIZE})` : `translate(${BASE_SIZE / 2} 0)`
      } else {
        // horizontla
        const leftX = Math.min(places[0][0], places[1][0])
        t = position[0] === leftX ? `translate(${BASE_SIZE} ${BASE_SIZE / 2})` : `translate(0 ${BASE_SIZE / 2})`
      }
      return this.transformPosition(position) + ' ' + t
    },
    
    rotateMeeple() {
      return `rotate(` + (-1 * this.rotate) + ` 0 0)`
    }
  }
}
</script>

<style lang="sass" scoped>
.fairy
  opacity: 0.9

.dragon
  opacity: 0.9

.fairy-select
  circle.color-stroke
    stroke: $fairy-color
    stroke-opacity: 0.5

    &.mouseover
      stroke-opacity: 1
</style>
