<template>
  <g
    id="emphasize-layer"
  >
    <defs>
      <mask id="emphasis-layer-mask">
        <rect x="0" y="0" width="100%" height="100vh" fill="white" />
        <g
          :transform="globalTransform"
          fill="black"
        >
          <rect
            v-if="emphasis.type === 'tile'"
            :x="0" :y="0" width="1000" height="1000"
            :transform="transformPosition(emphasis.position)"
          />
          <g
            v-else-if="emphasis.type === 'tiles'"
          >
            <rect
              v-for="pos in emphasis.positions"
              :key="positionAsKey(pos)"
              :x="0" :y="0" width="1000" height="1000"
              :transform="transformPosition(pos)"
            />
          </g>
          <circle
            v-else-if="emphasis.type === 'meeple'"
            :x="0" :y="0" r="500"
            :transform="emphasis.barn ? transformPosition(emphasis.position) : transformPoint(emphasis)"
          />
          <g v-else-if="emphasis.type === 'feature'">
            <path
              v-for="({ tile, clip, rotation }, idx) in featurePlaces"
              :key="idx"
              :d="clip"
              :transform="transformPosition(tile.position) + ' ' + transformRotation(rotation)"
            />
          </g>
          <circle
            v-else-if="emphasis.type === 'castle'"
            v-bind="castlePoint()" r="600"
            :transform="transformPosition(emphasis.positions[0])"
          />
        </g>
      </mask>
    </defs>

    <rect
      width="100%" height="100%"
      fill="white"
      fill-opacity="0.7"
      mask="url(#emphasis-layer-mask)"
    />
  </g>
</template>

<script>
import LayerMixin from '@/components/game/layers/LayerMixin'

export default {
  mixins: [LayerMixin],

  props: {
    globalTransform: { type: String, required: true },
    emphasis: { type: Object, required: true }
  },

  computed: {
    featurePlaces () {
      if (this.emphasis.type === 'feature') {
        return this.emphasis.places.map(({ tile, location }) => {
          return { tile, ...this.$theme.getFeature(tile, location, this.bridges) }
        })
      }
      return null
    }
  },

  methods: {
    castlePoint () {
      const { positions } = this.emphasis
      if (positions[0][0] === positions[1][0]) { /// compare X
        // vertical
        return positions[0][1] < positions[1][1] ? { cx: 500, cy: 1000 } : { cx: 500, cy: 1000 }
      } else {
        // horizontla
        return positions[0][0] < positions[1][0] ? { cx: 1000, cy: 500 } : { cx: 0, cy: 500 }
      }
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
