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
            <g
              v-for="(feature, idx) in featurePlaces"
              :key="idx"
              :transform="transformPosition(feature.tile.position)"
            >
              <path
                v-if="feature.clip[0] !== '<'"
                :d="feature.clip"
                :transform="transformRotation(feature.rotation) + ' ' + (feature.transform || '')"
              />
              <!-- eslint-disable vue/no-v-html-->
              <g
                v-else
                :transform="transformRotation(feature.rotation) + ' ' + (feature.transform || '')"
                v-html="feature.clip"
              />
            </g>
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
      class="emphasize-lightbox"
      width="100%" height="100%"
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
      try {
        if (this.emphasis.type === 'feature') {
          return this.emphasis.places.map(({ tile, location }) => {
            return { tile, ...this.$theme.getFeature(tile, location, this.bridges) }
          }).filter(f => {
            // be defensive
            if (!f.clip) {
              console.warn('Feature without clip', f)
            }
            return f.clip
          })
        }
      } catch (e) {
        console.error(e)
      }
      return []
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
.emphasize-lightbox
  +theme using ($theme)
    fill: map-get($theme, 'emphasize-lightbox-fill')
</style>
