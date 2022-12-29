<template>
  <g class="area-select-layer" :class="'mode-' + mode">
    <g
      v-for="({option: opt, feature}) in optionsWithFeature"
      :key="positionAsKey([0, 0]) + opt.featureType + opt.location"
    >
      <g
        v-if="mode === 'meeples'"
        :transform="artwork.inverseScaleTransform + ' ' + transformFeaturePoint(feature)"
        class="color-1"
      >
        <use
          :class="{meeple: true, 'rot-90': opt.featureType === 'Field'}"
          :x="-BASE_SIZE * 0.16"
          :y="-BASE_SIZE * 0.16"
          :width="BASE_SIZE * 0.32"
          :height="BASE_SIZE * 0.32"
          :href="`${MEEPLES_SVG}#small-follower`"
          @click="ev => onSelect(opt, feature)"
          @mouseenter="onMouseOver(opt, feature)"
          @mouseleave="onMouseLeave(opt, feature)"
        />
      </g>
      <g
        v-else
        :transform="artwork.inverseScaleTransform + ' ' + transformRotation(feature.rotation) + ' ' + (feature.transform || '')"
        :class="{ area: true, [opt.cssClass]: true, mouseover: opt === mouseOver, mouseout: opt !== mouseOver }"
        @mouseenter="onMouseOver(opt, feature)"
        @mouseleave="onMouseLeave(opt, feature)"
        @click="ev => onSelect(opt, feature)"
      >
        <FeatureClip :clip="feature.clip" />
      </g>
    </g>
  </g>
</template>

<script>
import LayerMixin from '@/components/game/layers/LayerMixin'
import Location from '@/models/Location'
import FeatureClip from '@/components/game/layers/FeatureClip.vue'
import { BASE_SIZE } from '@/constants/ui'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  components: {
    FeatureClip
  },

  mixins: [LayerMixin],

  props: {
    mode: { type: String, required: true },
    tileId: { type: String, required: true },
    tileSize: { type: Number, required: true },
    rotation: { type: Number, required: true },
    artwork: { type: Object, required: true }
  },

  data () {
    return {
      MEEPLES_SVG,
      BASE_SIZE,
      mouseOver: null
    }
  },

  computed: {
    optionsWithFeature () {
      const optionsWithFeature = []
      const tile = this.$theme.getTile(this.tileId)

      if (!tile) {
        return []
      }

      Object.keys(tile.features).forEach(fp => {
        if (fp === 'X') return // supplementary "fake" feature
        const [featureType, _location] = fp.split('/')
        if (featureType === 'X' || featureType === 'Inn') return // also supplementary "fake" feature
        const locObj = Location.parse(_location)
        if (!locObj) {
          console.warn(`Invalid location ${fp} on ${this.tileId}`)
          return
        }
        const location = locObj.rotateCW(this.rotation).name
        const feature = this.$theme.getFeature({
          id: this.tileId,
          position: [0, 0],
          rotation: this.rotation
        }, featureType, location)
        if (!feature) {
          console.warn(`No feature for ${fp} on ${this.tileId}`)
          return
        }

        const opt = {
          option: { location, featureType, cssClass: featureType.toLowerCase() },
          feature
        }

        if (!opt.feature.clip) {
          console.error(`Clipping is not defined for ${tile.id} ${location}`)
        }

        optionsWithFeature.push(opt)
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
    onMouseOver (opt, feature) {
      this.mouseOver = opt
      const location = Location.parse(opt.location).rotateCCW(feature.rotation).name
      this.$emit('tooltip', opt.featureType + '/' + location)
    },

    onMouseLeave (opt, feature) {
      this.mouseOver = null
      this.$emit('tooltip', null)
    },

    onSelect (option, feature) {
      const location = Location.parse(option.location).rotateCCW(feature.rotation).name
      console.log(option.featureType + '/' + location + ' @ ' + feature.rotation)
    },

    transformFeaturePoint (feature) {
      const { point, rotation, transform, inverseScaleTransform } = feature
      if (!point) {
        console.error('No point for ', feature)
        return ''
      }
      return `${this.transformRotation(rotation)} ${transform || ''} translate(${point[0]} ${point[1]}) rotate(${-rotation} 0 0) ${inverseScaleTransform || ''}`
    }
  }
}
</script>

<style lang="sass" scoped>
$c-default: gray
$c-city: Tomato
$c-city-stroke: red
$c-road: blue
$c-field: DarkTurquoise
$c-field-stroke: Cyan
$c-monastery: magenta
$c-tower: yellow

.area-select-layer.mode-strokes
  .area
    fill: transparent
    stroke-width: 10px
    stroke: $c-default
    stroke-opacity: 0.9

  .area.mouseover
    fill: $c-default
    stroke: transparent

  .area.city
    stroke: $c-city-stroke

    &.mouseover
      fill: $c-city

  .area.road
    stroke: $c-road

    &.mouseover
      fill: $c-road

  .area.field
    stroke: $c-field-stroke

    &.mouseover
      fill: $c-field

  .area.monastery, .area.yagahut, .area.garden
    stroke: $c-monastery

    &.mouseover
      fill: $c-monastery

  .area.tower
    stroke: $c-tower

    &.mouseover
      fill: $c-tower

.area-select-layer.mode-shapes
  .area
    opacity: 0.6

  .area.mouseover
    opacity: 1

  .area.city
    fill: $c-city

  .area.road
    fill: $c-road

  .area.field
    fill: $c-field

  .area.monastery, .area.yagahut, .area.garden
    fill: $c-monastery

  .area.tower
    fill: $c-tower

.area-select-layer.mode-meeples
  .meeple
    opacity: 0.6
</style>
