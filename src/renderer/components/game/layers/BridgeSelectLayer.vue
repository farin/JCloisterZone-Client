<template>
  <g id="bridge-select-layer">
    <g
      v-for="opt in options"
      :key="`${opt.position}:${opt.location}`"
      :transform="transformPosition(opt.position)"
    >
      <path
        d="M 0 600 L 0 400 L 1000 400 L 1000 600 L 850 600 C 850 435 150 435 150 600 Z"
        fill="white"
        :fill-opacity="mouseOver === opt ? 0.8 : 0.4"
        :transform="opt.location === 'NS' ? 'rotate(90 500 500)' : ''"
      />

      <!-- invisible shape for tracking mouse events -->
      <rect
        x="0" y="400" width="1000" height="200"
        :style="{'pointer-events': 'all', fill: 'none'}"
        :transform="opt.location === 'NS' ? 'rotate(90 500 500)' : ''"
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
