<template>
  <g id="tunnel-select-layer">
    <g
      v-for="({option: opt, feature}) in mappedOptions"
      :key="`${opt.position}:${opt.location}`"
      :transform="transformPosition(opt.position) + ' ' + transformRotation(feature.rotation) + ' ' + (feature.transform || '')"
      :class="tunnelTokenColorCssClass(token, player)"
    >
      <FeatureClip
        :clip="feature.clip"
        :class="{'color-stroke': true, mouseover: mouseOver === opt}"
        fill="none"
        stroke-width="60"
      />

      <!-- invisible shape for tracking mouse events -->
      <g
        :style="{'pointer-events': 'all', fill: 'none'}"
        @mouseenter="onMouseOver(opt)"
        @mouseleave="onMouseLeave(opt)"
        @click="ev => onSelect(ev, opt)"
      >
        <FeatureClip
          :clip="feature.clip"
        />
      </g>
    </g>
  </g>
</template>

<script>
import { mapGetters } from 'vuex'

import LayerMixin from '@/components/game/layers/LayerMixin'
import FeatureClip from '@/components/game/layers/FeatureClip.vue'

export default {
  components: {
    FeatureClip
  },

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
        const tile = this.tileOn(option.position)
        const feature = this.$theme.getFeature(tile, 'Tunnel', option.location, [])
        return {
          feature,
          option
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

.color-stroke
  stroke-opacity: 0.4

  &.mouseover
    stroke-opacity: 1
</style>
