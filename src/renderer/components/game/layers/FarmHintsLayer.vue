<template>
  <g id="farm-hints-layer">
    <defs>
      <pattern
        id="farm-hint-pattern-1"
        x="0" y="0" width="200" height="200"
        patternUnits="userSpaceOnUse"
        :patternTransform="globalTransform"
      >
        <rect class="checker" x="0" width="100" height="100" y="0" />
        <rect class="checker" x="100" width="100" height="100" y="100" />
      </pattern>

      <clipPath
        v-for="fc in fieldsClip"
        :id="fc.id"
        :key="fc.id"
      >
        <FeatureClip
          v-for="(c, idx) in fc.clips"
          :key="idx"
          :clip="c.clip"
          :transform="c.transform"
        />
      </clipPath>
    </defs>

    <rect
      v-for="field in filedsMapped"
      :key="'farm-hint-'+field.id"
      :clip-path="'url(#farm-hint-clip-' + field.id + ')'"
      width="100%" height="100%"
      fill="url(#farm-hint-pattern-1)"
    />
  </g>
</template>

<script>
import { mapState } from 'vuex'

import LayerMixin from '@/components/game/layers/LayerMixin'
import FeatureClip from '@/components/game/layers/FeatureClip.vue'

export default {
  components: {
    FeatureClip
  },

  mixins: [LayerMixin],

  props: {
    globalTransform: { type: String, required: true }
  },

  data () {
    return {
    }
  },

  computed: {
    ...mapState({
      fields: state => state.game.features.filter(f => f.type === 'Field' && f.places.length > 1)
    }),

    filedsMapped () {
      return this.fields.map(field => {
        let places = []
        try {
          places = field.places.map(place => {
            const location = place[2]
            const tile = this.tileOn(place)
            const f = this.$theme.getFeature(tile, field.type, location)
            return { tile, ...f }
          }).filter(f => {
            // be defensive
            if (!f.clip) {
              console.warn('Feature without clip', f)
            }
            return f.clip
          })
        } catch (e) {
          console.error(e)
        }
        return {
          id: field.places[0].join('-').replaceAll('.', '_'),
          places
        }
      }).filter(f => f.places.length)
    },

    fieldsClip () {
      // <g> tags are not supported inside clip-path, transforms must be combined manually
      return this.filedsMapped.map(f => {
        return {
          id: 'farm-hint-clip-' + f.id,
          clips: f.places.map(p => {
            const tPos = this.transformPosition(p.tile.position)
            const fPos = this.transformRotation(p.rotation) + ' ' + (p.transform || '')
            return {
              transform: `${this.globalTransform} ${tPos} ${fPos}`,
              clip: p.clip
            }
          })
        }
      })
    }
  },

  methods: {

  }
}
</script>

<style lang="sass" scoped>
</style>
