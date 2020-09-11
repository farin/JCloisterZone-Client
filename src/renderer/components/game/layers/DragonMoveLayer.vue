<template>
  <g id="dragon-move-layer">
    <g
      v-for="pos in options"
      :key="positionAsKey(pos)"
      :transform="transformPosition(pos)"
    >
      <polygon
        :transform="arrowTransform(pos)"
        fill="#7a172d"
        :fill-opacity="mouseOver === pos ? 1 : 0.5"
        points="90,1000 400,1000 400,1090 600,1090 600,1000 910,1000 500,700"
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
      dragon: state => state.game.neutralFigures.dragon
    })
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
    },

    arrowTransform (pos) {
      const x = this.dragon.position[0] - pos[0]
      const y = this.dragon.position[1] - pos[1]
      if (x === 0) {
        return this.transformRotation(y === -1 ? 180 : 0)
      } else {
        return this.transformRotation(x === -1 ? 90 : 270)
      }
    }
  }
}
</script>

<style>
</style>
