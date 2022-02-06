<template>
  <g id="bridge-select-layer">
    <g
      v-for="opt in options"
      :key="`${opt.position}:${opt.location}`"
      :transform="transformPosition(opt.position)"
    >
      <path
        d="M 0 540 L 0 360 L 900 360 L 900 540 L 765 540 C 765 392 135 392 135 540 Z"
        fill="white"
        :fill-opacity="mouseOver === opt ? 0.8 : 0.4"
        :transform="opt.location === 'NS' ? 'rotate(90 450 450)' : ''"
      />

      <!-- invisible shape for tracking mouse events -->
      <rect
        x="0" y="360" width="900" height="180"
        :style="{'pointer-events': 'all', fill: 'none'}"
        :transform="opt.location === 'NS' ? 'rotate(90 450 450)' : ''"
        @mouseenter="onMouseOver(opt)"
        @mouseleave="onMouseLeave(opt)"
        @click="ev => onSelect(ev, opt)"
      />
    </g>
  </g>
</template>

<script>
import LayerMixin from '@/components/game/layers/LayerMixin'

export default {
  mixins: [LayerMixin],

  props: {
    options: { type: Array, required: true },
    css: { type: String, default: null }
  },

  data () {
    return {
      mouseOver: null
    }
  },

  methods: {
    onMouseOver (opt) {
      this.mouseOver = opt
    },

    onMouseLeave (opt) {
      this.mouseOver = null
    },

    onSelect (ev, opt) {
      if (!this.isDragging(ev)) {
        this.$root.$emit('bridge.select', opt)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
