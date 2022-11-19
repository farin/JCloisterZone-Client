<template>
  <g id="farm-hints-layer">
    <defs
      v-for="(pattern, idx) in patterns"
      :key="idx"
    >
      <component
        :is="pattern.component"
        v-for="p in patternPlayerIndexes"
        :id="'farm-hint-pattern-' + idx + '-' + (p === null ? 'N' : p)"
        :key="p"
        :pattern-transform="globalTransform + ' ' + (pattern.transform || '')"
        :player="p"
      />
    </defs>
    <!--- todo on demand multicolor -->
    <defs>
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
      :fill="`url(#${field.pattern})`"
    />
  </g>
</template>

<script>
import { mapState } from 'vuex'

import LayerMixin from '@/components/game/layers/LayerMixin'
import FeatureClip from '@/components/game/layers/FeatureClip.vue'
import CheckerPattern from '@/components/game/layers/patterns/CheckerPattern.vue'
import LinePattern from '@/components/game/layers/patterns/LinePattern.vue'
import TrianglePattern from '@/components/game/layers/patterns/TrianglePattern.vue'
import ZigZagPattern from '@/components/game/layers/patterns/ZigZagPattern.vue'

function positiveHashCode (str) {
  const code = str.split('').reduce((prevHash, currVal) =>
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0, 0)
  return Math.abs(code)
}

function minLoc (places) {
  return places.reduce((min, p) => {
    const a = Math.abs(min[0]) + Math.abs(min[1])
    const b = Math.abs(p[0]) + Math.abs(p[1])
    if (a < b) return min
    if (a > b) return p
    if (min[2] <= p[2]) return min
    return p
  })
}

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
      patterns: [
        { component: CheckerPattern },
        { component: LinePattern },
        { component: TrianglePattern, transform: 'scale(1.5)' },
        { component: ZigZagPattern, transform: 'scale(1.4)' },
        { component: LinePattern, transform: 'rotate(45)' },
        { component: CheckerPattern, transform: 'rotate(45) scale(1.25)' },
        { component: LinePattern, transform: 'rotate(-45)' },
        { component: ZigZagPattern, transform: 'rotate(90) scale(1.4)' },
        { component: LinePattern, transform: 'rotate(-90)' }
      ]
    }
  },

  computed: {
    ...mapState({
      players: state => state.game.players,
      fields: state => state.game.features.filter(f => {
        if (f.type !== 'Field') return false
        // ignore small tiny fields
        if (!f.owners.length) return f.cities && f.places.length > 1
        return true
      })
    }),

    patternPlayerIndexes () {
      const res = [null]
      this.players.forEach((p, idx) => res.push(idx))
      return res
    },

    filedsMapped () {
      const fields = []
      this.fields.forEach(field => {
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
          return
        }
        // try to assign stable id
        const id = minLoc(field.places).join('-').replaceAll('.', '_')
        const owner = field.owners.length !== 1 ? 'N' : field.owners[0]
        const patternIdx = positiveHashCode(id) % this.patterns.length
        fields.push({
          id,
          pattern: `farm-hint-pattern-${patternIdx}-${owner}`,
          places
        })
      })

      return fields
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
  }
}
</script>

<style lang="sass" scoped>
.farm-hint-area
  opacity: 0.4
</style>

<style lang="sass">
.neutral-pattern
  fill: #444
  opacity: 0.6
</style>
