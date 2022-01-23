<template>
  <g id="tile-select-layer">
    <g
      v-for="pos in options"
      :key="positionAsKey(pos)"
      :transform="transformPosition(pos)"
    >
      <circle
        :cx="BASE_SIZE / 2"
        :cy="BASE_SIZE / 2"
        :r="BASE_SIZE * 0.42"
        fill="none"
        :stroke="color"
        :stroke-width="BASE_SIZE * 0.07"
        :stroke-opacity="mouseOver === pos ? 1 : 0.5"
      />

      <!-- invisible rect for tracking mouse events -->
      <rect
        :x="0" :y="0" :width="BASE_SIZE" :height="BASE_SIZE"
        :style="{'pointer-events': 'all', fill: 'none'}"
        @mouseenter="onMouseOver(pos)"
        @mouseleave="onMouseLeave(pos)"
        @click="ev => onClick(ev, pos)"
      />
    </g>
  </g>
</template>

<script>
import LayerMixin from '@/components/game/layers/LayerMixin'
import { BASE_SIZE } from '@/constants/ui'

export default {
  components: {
  },

  mixins: [LayerMixin],

  props: {
    options: { type: Array, required: true },
    color: { type: String, required: true }
  },

  data () {
    return {
      mouseOver: null,
      BASE_SIZE
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

      this.$root.$emit('tile.select', position)
    }
  }
}
</script>

<style>
</style>
