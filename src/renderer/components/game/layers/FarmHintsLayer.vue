<template>
  <g id="farm-hints-layer">
    <defs>
      <CheckerPattern
        v-for="p in patterns"
        :id="'farm-hint-pattern-1-' + (p === null ? 'N' : p)"
        :key="p"
        :pattern-transform="globalTransform"
        :player="p"
      />

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
      class="farm-hint-area"
      :clip-path="'url(#farm-hint-clip-' + field.id + ')'"
      width="100%" height="100%"
      :fill="`url(#farm-hint-pattern-1-${field.owner || 'N'})`"
    />
  </g>
</template>

<script>
import { mapState } from 'vuex'

import LayerMixin from '@/components/game/layers/LayerMixin'
import FeatureClip from '@/components/game/layers/FeatureClip.vue'
import CheckerPattern from '@/components/game/layers/patterns/CheckerPattern.vue'

export default {
  components: {
    CheckerPattern,
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
      players: state => state.game.players,
      fields: state => state.game.features.filter(f => f.type === 'Field' && f.cities && f.places.length > 1)
    }),

    patterns () {
      const res = [null]
      console.log(this.players)
      this.players.forEach((p, idx) => res.push(idx))
      return res
    },

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
          owner: field.owners.length !== 1 ? null : field.owners[0],
          places
        }
      }).filter(f => f.places.length) // filter out errors
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
.farm-hint-area
  opacity: 0.4
</style>
