<template>
  <g id="tunnel-select-layer">
    <g
      v-for="option in options"
      :key="`${option.position}:${option.location}`"
      :transform="transformTunnelEnd(option)"
      :class="tunnelTokenColorCssClass(token, player)"
    >
      <circle
        cx="0" cy="0" r="200"
        :class="{'color-stroke': true, mouseover: mouseOver === option}"
        fill="none"
        stroke-width="60"
      />

      <!-- invisible shape for tracking mouse events -->
      <circle
        cx="0" cy="0" r="200"
        :style="{'pointer-events': 'all', fill: 'none'}"
        @mouseenter="onMouseOver(option)"
        @mouseleave="onMouseLeave(option)"
        @click="ev => onSelect(ev, option)"
      />
    </g>
  </g>
</template>

<script>
import { mapGetters } from 'vuex'

import { getMeeplePlayer } from '@/utils/game'
import LayerMixin from '@/components/game/layers/LayerMixin'

export default {
  mixins: [LayerMixin],

  props: {
    player: { type: Number, required: true },
    token: { type: String, required: true },
    options: { type: Array, required: true }
  },

  data () {
    return {
      mouseOver: null
    }
  },

  computed: {
    ...mapGetters({
      tunnelTokenColorCssClass: 'game/tunnelTokenColorCssClass'
    }),

    mappedOptions () {
      return this.options.map(option => {
        const { meepleId, featurePointer: ptr } = option
        return {
          option,
          ptr,
          meeplePlayer: getMeeplePlayer(meepleId)
        }
      })
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
        this.$root.$emit('feature.select', opt)
      }
    }
  }
}
</script>

<style lang="sass" scoped>

circle.color-stroke
  stroke-opacity: 0.4

  &.mouseover
    stroke-opacity: 1
</style>
