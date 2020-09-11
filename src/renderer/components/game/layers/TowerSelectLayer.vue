<template>
  <g id="dragon-move-layer">
    <g
      v-for="{ position, reachPolygon } in towers"
      :key="positionAsKey(position)"
    >
      <circle
        :transform="transformPoint({ position, location: 'TOWER' })"
        :cx="0" cy="0" r="420"
        fill="none"
        stroke="black"
        stroke-width="70"
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
          stroke-width="40"
          stroke-opacity="0.2"
        />
        <!-- invisible rect for tracking mouse events -->
        <rect
          :x="0" :y="0" width="1000" height="1000"
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

export default {
  components: {
  },

  mixins: [LayerMixin],

  props: {
    options: { type: Array, required: true }
  },

  data () {
    return {
      mouseOver: null
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
        const reachPolygon = `-20,-20 -20,${-20 - h * 1000} 1020,${-20 - h * 1000} 1020,-20 ${20 + (h + 1) * 1000},-20 ${20 + (h + 1) * 1000},1020, 1020,1020 1020,${20 + (h + 1) * 1000} -20,${20 + (h + 1) * 1000} -20,1020 ${-20 - h * 1000},1020 ${-20 - h * 1000},-20`

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
