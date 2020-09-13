<template>
  <div class="game-setup-overview">
    <section>
      <div
        v-for="{ expansion, set, quantity } in tileSets"
        :key="set.id"
        class="tile-set"
      >
        <div class="symbol-wrapper">
          <span
            v-if="quantity > 1"
            class="quantity"
          >{{ quantity }}</span>
          <ExpansionSymbol :expansion="expansion" :size="48" />
        </div>
        <div class="box-title">{{ set.title }}</div>
      </div>
    </section>
    <div v-if="additions.length" class="section-delimiter">
      <v-icon>fas fa-plus</v-icon>
    </div>
    <section>
      <OverviewElementTile
        v-for="([element, value]) in additions"
        :key="element"
        :element="element"
        :value="value"
      />
    </section>
    <div v-if="removals.length" class="section-delimiter">
      <v-icon>fas fa-minus</v-icon>
    </div>
    <section>
      <OverviewElementTile
        v-for="([element, value]) in removals"
        :key="element"
        :element="element"
        :value="value"
      />
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import uniq from 'lodash/uniq'

import { Expansion } from '@/models/expansions'
import { isConfigValueEnabled, getDefaultElements } from '@/models/elements'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import NeutralFigure from '@/components/game/NeutralFigure'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'
import OverviewElementTile from '@/components/game-setup/overview/OverviewElementTile'

export default {
  components: {
    ExpansionSymbol,
    NeutralFigure,
    StandaloneTileImage,
    OverviewElementTile
  },

  props: {
    sets: { type: Object, required: true },
    elements: { type: Object, required: true }
  },

  computed: {
    tileSets () {
      const tileSets = []
      Expansion.all().forEach(expansion => {
        expansion.sets.forEach(set => {
          const quantity = this.sets[set.id] || this.sets[set.id + ':1'] || this.sets[set.id + ':2']
          if (quantity) {
            tileSets.push({ expansion, set, quantity })
          }
        })
      })
      return tileSets
    },

    nonDefaultElements (before, after) {
      const defaults = getDefaultElements(this.sets)
      const keys = uniq([...Object.keys(defaults), ...Object.keys(this.elements)])
      const diff = {}
      keys.forEach(cid => {
        if (defaults[cid] !== this.elements[cid]) {
          diff[cid] = this.elements[cid] === undefined ? false : this.elements[cid]
        }
      })
      return Object.entries(diff)
    },

    additions () {
      return this.nonDefaultElements.filter(el => isConfigValueEnabled(el[1]))
    },

    removals () {
      return this.nonDefaultElements.filter(el => !isConfigValueEnabled(el[1]))
    }
  },

  methods: {
    isMeeple (el) {
      return MEEPLES.includes(el)
    },

    isConfigValueEnabled (val) {
      return isConfigValueEnabled(val)
    }
  }
}
</script>

<style lang="sass">
.game-setup-overview
  section
    display: flex
    flex-wrap: wrap

  .section-delimiter
    text-align: center
    padding: 15px

  .tile-set, .element-box
    flex-shrink: 0
    margin: 2px
    border-radius: 6px
    width: 120px
    height: 148px
    background: white
    overflow: hidden

  .tile-set
    .quantity
      position: relative
      font-weight: 300
      font-size: 34px
      top: -15px
      margin-right: 4px

  .symbol-wrapper
    height: 74px
    padding-top: 15px
    text-align: center

    .tile-img, img
      filter: grayscale(100%)

  .box-title
    border-top: 1px solid #f0f0f0
    height: 74px
    margin: 0 10px
    font-size: 14px
    font-weight: 300
    text-transform: uppercase
    display: flex
    justify-content: center
    align-items: center
    text-align: center
</style>
