<template>
  <g
    id="castle-base-select-layer"
    :class="'area-select-layer ' + colorCssClass(player)"
  >
    <g
      v-for="({option: opt, pos2, feature1, feature2}) in mappedOptions"
      :key="positionAsKey(opt.position) + opt.location"
    >
      <path
        :d="feature1.clip"
        :transform="transformPosition(opt.position) + ' ' + transformRotation(feature1.rotation) + ' ' + (feature1.transform || '')"
        :class="{ area: true, mouseover: opt === mouseOver, mouseout: opt !== mouseOver }"
        @mouseenter="onMouseOver(opt)"
        @mouseleave="onMouseLeave(opt)"
        @click="ev => onSelect(ev, opt)"
      />
      <path
        :d="feature2.clip"
        :transform="transformPosition(pos2) + ' ' + transformRotation(feature2.rotation) + ' ' + (feature2.transform || '')"
        :class="{ area: true, mouseover: opt === mouseOver, mouseout: opt !== mouseOver }"
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
  components: {
  },

  mixins: [LayerMixin],

  props: {
    player: { type: Number, required: true },
    options: { type: Array, required: true }
  },

  data () {
    return {
      mouseOver: null
    }
  },

  computed: {
    mappedOptions () {
      return this.options.map(option => {
        const opp = this.getOppositePtr(option)
        const tile1 = this.tileOn(option.position)
        const tile2 = this.tileOn(opp.position)
        return {
          option,
          pos2: opp.position,
          feature1: this.$theme.getFeature(tile1, option.location, this.bridges),
          feature2: this.$theme.getFeature(tile2, opp.location, this.bridges)
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
    },

    getOppositePtr ({ position, location }) {
      if (location === 'N') {
        return { position: [position[0], position[1] - 1], location: 'S' }
      }
      if (location === 'S') {
        return { position: [position[0], position[1] + 1], location: 'N' }
      }
      if (location === 'W') {
        return { position: [position[0] - 1, position[1]], location: 'E' }
      }
      if (location === 'E') {
        return { position: [position[0] + 1, position[1]], location: 'W' }
      }
      throw new Error('Invalid location')
    }
  }
}
</script>

<style lang="sass" scoped>
.area.mouseout
  opacity: 0
</style>
