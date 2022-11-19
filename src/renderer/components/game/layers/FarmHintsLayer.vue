<template>
  <g id="farm-hints-layer">
    <g
      v-for="field in filedsMapped"
      :key="field.id"
      fill="black"
    >
      <g
        v-for="(p, idx) in field.places"
        :key="idx"
        :transform="transformPosition(p.tile.position)"
      >
        <g :transform="transformRotation(p.rotation) + ' ' + (p.transform || '')">
          <FeatureClip :clip="p.clip" />
        </g>
      </g>
    </g>
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
          id: field.places[0].join(','),
          places
        }
      }).filter(f => f.places.length)
    }
  },

  methods: {

  }
}
</script>

<style lang="sass" scoped>
</style>
