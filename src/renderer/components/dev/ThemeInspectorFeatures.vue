<template>
  <g class="area-select-layer" :class="'mode-' + mode">
    <g
      v-for="({option: opt, feature}) in optionsWithFeature"
      :key="positionAsKey([0, 0]) + opt.featureType + opt.location"
    >
      <g
        v-if="mode === 'meeples'"
        :transform="transformFeaturePoint(feature)"
        class="color-1"
      >
        <use
          :class="{meeple: true, 'rot-90': opt.featureType === 'Field'}"
          x="-160" y="-160"
          width="320" height="320"
          :href="`${MEEPLES_SVG}#small-follower`"
          @click="ev => onSelect(opt, feature)"
        />
      </g>
      <g v-else>
        <path
          v-if="feature.clip && feature.clip[0] !== '<'"
          :d="feature.clip"
          :transform="transformRotation(feature.rotation) + ' ' + (feature.transform || '')"
          :class="{ area: true, [opt.cssClass]: true, mouseover: opt === mouseOver, mouseout: opt !== mouseOver }"
          @mouseenter="onMouseOver(opt)"
          @mouseleave="onMouseLeave(opt)"
          @click="ev => onSelect(opt, feature)"
        />
        <!-- eslint-disable vue/no-v-html-->
        <g
          v-else-if="feature.clip"
          :transform="transformRotation(feature.rotation) + ' ' + (feature.transform || '')"
          :class="{ area: true, [opt.cssClass]: true, mouseover: opt === mouseOver, mouseout: opt !== mouseOver }"
          @mouseenter="onMouseOver(opt)"
          @mouseleave="onMouseLeave(opt)"
          @click="ev => onSelect(opt, feature)"
          v-html="feature.clip"
        />
      </g>
    </g>
  </g>
</template>

<script>
import LayerMixin from '@/components/game/layers/LayerMixin'
import Location from '@/models/Location'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  components: {
  },

  mixins: [LayerMixin],

  props: {
    mode: { type: String, required: true },
    tileId: { type: String, required: true },
    tileSize: { type: Number, required: true },
    rotation: { type: Number, required: true }
  },

  data () {
    return {
      MEEPLES_SVG,
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
        const [featureType, _location] = fp.split('/')
        const location = Location.parse(_location).rotateCW(this.rotation).name

        const opt = {
          option: { location, featureType, cssClass: featureType.toLowerCase() },
          feature: this.$theme.getFeature({
            id: this.tileId,
            position: [0, 0],
            rotation: this.rotation
          }, featureType, location)
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
    onMouseOver (opt) {
      this.mouseOver = opt
    },

    onMouseLeave (opt) {
      this.mouseOver = null
    },

    onSelect (option, feature) {
      const location = Location.parse(option.location).rotateCCW(feature.rotation).name
      console.log(option.featureType + '/' + location + ' @ ' + feature.rotation)
    },

    transformFeaturePoint (feature) {
      const { point, rotation, transform, inverseScaleTransform } = feature
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
