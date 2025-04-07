<template>
  <g id="farm-hints-layer">
    <defs>
      <component
        :is="p.component"
        v-for="p in filedsMapped.usedPatterns"
        :id="p.id"
        :key="p.id"
        :pattern-transform="globalTransform + ' ' + (p.transform || '')"
        v-bind="p.props"
      />
    </defs>

    <!--- todo on demand multicolor -->
    <defs>
      <clipPath
        v-for="fc in filedsMapped.clips"
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
      v-for="field in filedsMapped.fields"
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

import CheckerPattern from '@/components/game/layers/patterns/CheckerPattern.vue'
import FeatureClip from '@/components/game/layers/FeatureClip.vue'
import LayerMixin from '@/components/game/layers/LayerMixin'
import LinePattern from '@/components/game/layers/patterns/LinePattern.vue'
import MultiColorPattern from '@/components/game/layers/patterns/MultiColorPattern.vue'
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
      const usedPatterns = {}
      const clips = []

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
        const fieldId = minLoc(field.places).join('-').replaceAll('.', '_')
        const patternIndex = positiveHashCode(fieldId) % this.patterns.length
        const props = {}
        let pattern
        let patternId
        if (field.owners.length > 1) {
          const owners = [...field.owners]
          owners.sort()
          patternId = '-' + owners.join('-')
          pattern = {
            component: MultiColorPattern
          }
          props.players = owners
        } else {
          patternId = '' + patternIndex
          pattern = this.patterns[patternIndex]
          if (field.owners.length === 1) {
            patternId += '--' + field.owners[0]
            props.player = field.owners[0]
          }
        }

        patternId = 'farm-hint-pattern-' + patternId
        if (!usedPatterns[patternId]) {
          usedPatterns[patternId] = {
            id: patternId,
            props,
            ...pattern
          }
        }

        clips.push({
          id: 'farm-hint-clip-' + fieldId,
          clips: places.map(p => {
            const tPos = this.transformPosition(p.tile.position)
            const fPos = this.transformRotation(p.rotation) + ' ' + (p.transform || '')
            return {
              transform: `${this.globalTransform} ${tPos} ${fPos}`,
              clip: p.clip
            }
          })
        })

        fields.push({
          id: fieldId,
          pattern: patternId
        })
      })

      return {
        fields,
        clips,
        usedPatterns: Object.values(usedPatterns)
      }
    }
  }
}
</script>

<style lang="sass">
.farm-hint-pattern
  opacity: 0.5

// for black and white set opacity manually to looks better
.farm-hint-pattern.color-7,
.farm-hint-pattern.color-8
  opacity: 0.7

// and same for orange
.farm-hint-pattern.color-4
  opacity: 0.6

.farm-hint-pattern-neutral
  fill: #444
  opacity: 0.3
</style>
