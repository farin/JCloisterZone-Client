<template>
  <g id="tower-select-layer">
    <g
      v-for="{ position, reachPolygon } in towers"
      :key="positionAsKey(position)"
    >
      <circle
        :transform="transformPoint({ position, feature: 'Tower', location: 'I' })"
        :cx="0" cy="0" :r="BASE_SIZE * 0.42"
        fill="none"
        stroke="black"
        stroke-width="63"
        :stroke-opacity="mouseOver === position ? 1 : 0.5"
      />

      <g
        :transform="transformPosition(position)"
      >
        <polygon
          v-if="mouseOver === position"
          :points="reachPolygon"
          fill="red"
          fill-opacity="0.06"
          stroke="red"
          :stroke-width="BASE_SIZE * 0.04"
          stroke-opacity="0.2"
        />
        <!-- invisible rect for tracking mouse events -->
        <rect
          :x="0" :y="0" :width="BASE_SIZE" :height="BASE_SIZE"
          :style="{'pointer-events': 'all', fill: 'none'}"
          @mouseenter="onMouseOver(position)"
          @mouseleave="onMouseLeave(position)"
          @click="ev => onClick(ev, position)"
        />
      </g>
    </g>
  </g>
</template>

<script>
import { mapState } from 'vuex'

import LayerMixin from '@/components/game/layers/LayerMixin'
import { BASE_SIZE } from '@/constants/ui'

export default {
  components: {
  },

  mixins: [LayerMixin],

  props: {
    options: { type: Array, required: true }
  },

  data () {
    return {
      mouseOver: null,
      BASE_SIZE
    }
  },

  computed: {
    ...mapState({
      heights: state => {
        const res = {}
        state.game.features.filter(f => f.type === 'Tower').forEach(f => {
          const position = f.places[0]
          res[position[0] + ',' + position[1]] = f.height
        })
        return res
      }
    }),

    towers () {
      return this.options.map(position => {
        const h = this.heights[position[0] + ',' + position[1]] + 1
        const o = BASE_SIZE * 0.02
        const reachPolygon = `-${o},-${o} -${o},${-o - h * BASE_SIZE} ${BASE_SIZE + o},${-o - h * BASE_SIZE} ${BASE_SIZE + o},-${o} ${o + (h + 1) * BASE_SIZE},-${o} ${o + (h + 1) * BASE_SIZE},${BASE_SIZE + o}, ${BASE_SIZE + o},${BASE_SIZE + o} ${BASE_SIZE + o},${o + (h + 1) * BASE_SIZE} -${o},${o + (h + 1) * BASE_SIZE} -${o},${BASE_SIZE + o} ${-o - h * BASE_SIZE},${BASE_SIZE + o} ${-o - h * BASE_SIZE},-${o}`

        return {
          position,
          reachPolygon
        }
      })
    }
  },

  methods: {
    onMouseOver (pos) {
      this.mouseOver = pos
    },

    onMouseLeave (pos) {
      this.mouseOver = null
    },

    onClick (ev, position) {
      if (this.isDragging(ev)) {
        return
      }

      this.$root.$emit('tower.select', position)
    }
  }
}
</script>

<style>
</style>
