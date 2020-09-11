<template>
  <g id="dragon-move-layer">
    <g
      v-for="pos in options"
      :key="positionAsKey(pos)"
      :transform="transformPosition(pos)"
    >
      <circle
        cx="500" cy="500" r="420"
        fill="none"
        :stroke="color"
        stroke-width="70"
        :stroke-opacity="mouseOver === pos ? 1 : 0.5"
      />

      <!-- invisible rect for tracking mouse events -->
      <rect
        :x="0" :y="0" width="1000" height="1000"
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
      mouseOver: null
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
