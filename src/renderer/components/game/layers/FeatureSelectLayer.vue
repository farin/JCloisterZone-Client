<template>
  <g
    id="feature-select-layer"
    :class="`area-select-layer ${cssClass} ${(player === null ? '' : colorCssClass(player))}`"
  >
    <g
      v-for="({option: opt, feature, abbotChoice}) in optionsWithFeature"
      :key="positionAsKey(opt.position) + opt.location"
      :transform="transformPosition(opt.position)"
    >
      <circle
        v-if="meeple == 'Barn'"
        :x="0" :y="0" r="400"
        :class="{ area: true, mouseover: opt === mouseOver, mouseout: opt !== mouseOver }"
        @mouseenter="onMouseOver(opt)"
        @mouseleave="onMouseLeave(opt)"
        @click="ev => onSelect(ev, opt, abbotChoice)"
      />
      <path
        v-else-if="feature.clip && feature.clip[0] !== '<'"
        :d="feature.clip"
        :transform="transformRotation(feature.rotation) + ' ' + (feature.transform || '')"
        :class="{ area: true, mouseover: opt === mouseOver, mouseout: opt !== mouseOver }"
        @mouseenter="onMouseOver(opt)"
        @mouseleave="onMouseLeave(opt)"
        @click="ev => onSelect(ev, opt, abbotChoice)"
      />
      <!-- eslint-disable vue/no-v-html-->
      <g
        v-else-if="feature.clip"
        :transform="transformRotation(feature.rotation) + ' ' + (feature.transform || '')"
        :class="{ area: true, mouseover: opt === mouseOver, mouseout: opt !== mouseOver }"
        @mouseenter="onMouseOver(opt)"
        @mouseleave="onMouseLeave(opt)"
        @click="ev => onSelect(ev, opt, abbotChoice)"
        v-html="feature.clip"
      />
    </g>
  </g>
</template>

<script>
import Location from '@/models/Location'

import LayerMixin from '@/components/game/layers/LayerMixin'

export default {
  components: {
  },

  mixins: [LayerMixin],

  props: {
    options: { type: Array, required: true },
    player: { type: Number, default: null },
    meeple: { type: String, default: null },
    cssClass: { type: String, default: '' }
  },

  data () {
    return {
      mouseOver: null
    }
  },

  computed: {
    optionsWithFeature () {
      const optionsWithFeature = []
      const cloisterOptionsWithFeature = []
      const monasteries = []
      this.options.forEach(option => {
        if (option.location === 'AS_ABBOT') {
          monasteries.push(option)
          return
        }
        const tile = this.tileOn(option.position)
        const opt = {
          option,
          feature: this.$theme.getFeature(tile, option.feature, option.location, this.bridges),
          abbotChoice: null
        }

        if (!opt.feature.clip) {
          console.error(`Clipping is not defined for ${tile.id} ${option.location}`)
        }

        optionsWithFeature.push(opt)
        if (option.location === 'I') {
          cloisterOptionsWithFeature.push(opt)
        }
      })

      monasteries.forEach(m => {
        const opt = cloisterOptionsWithFeature.find(({ option }) => option.position[0] === m.position[0] && option.position[1] === m.position[1])
        if (opt) {
          opt.abbotChoice = 'monk-or-as-abbot'
        } else {
          // abbot only placement
          const tile = this.tileOn(m.position)
          optionsWithFeature.push({
            option: m,
            feature: this.$theme.getFeature(tile, 'Monastery', 'I', this.bridges),
            abbotChoice: 'as-abbot-only'
          })
        }
      })

      optionsWithFeature.sort((a, b) => {
        const aBridge = a.feature.bridge || 0
        const bBridge = b.feature.bridge || 0
        if (aBridge !== bBridge) {
          return aBridge - bBridge
        }

        const aField = a.option.feature === 'Field'
        const bField = b.option.feature === 'Field'
        if (aField !== bField) {
          return bField - aField
        }
        return 0
      })

      return optionsWithFeature
    }
  },

  methods: {
    onMouseOver (opt) {
      this.mouseOver = opt
    },

    onMouseLeave (opt) {
      this.mouseOver = null
    },

    onSelect (ev, option, abbotChoice) {
      if (!this.isDragging(ev)) {
        if (abbotChoice) {
          this.$store.commit('gameDialog', {
            type: 'monk-or-abbot',
            attrs: {
              player: this.player,
              meeple: this.meeple,
              choice: abbotChoice,
              option
            }
          })
        } else {
          this.$root.$emit('feature.select', option)
        }
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.area.mouseout
  opacity: 0
</style>
