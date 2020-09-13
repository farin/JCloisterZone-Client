<template>
  <div class="game-setup-overview">
    <div
      v-for="{ expansion, set, quantity } in tileSets"
      :key="set.id"
      class="tile-set"
    >
      <div class="exp-symbol-wrapper">
        <span
          v-if="quantity > 1"
          class="quantity"
        >{{ quantity }}</span>
        <ExpansionSymbol :expansion="expansion" :size="54" />
      </div>
      <div class="exp-title">{{ set.title }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { Expansion } from '@/models/expansions'
import ExpansionSymbol from '@/components/ExpansionSymbol'

export default {
  components: {
    ExpansionSymbol
  },

  props: {
    sets: { type: Object, required: true }
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
    }
  }
}
</script>

<style lang="sass" scoped>
.game-setup-overview
  display: flex
  flex-wrap: wrap

.tile-set
  flex-shrink: 0
  margin: 2px
  border-radius: 6px
  width: 120px
  height: 148px
  padding-top: 10px
  background: white
  overflow: hidden

  .quantity
    position: relative
    font-weight: 300
    font-size: 34px
    top: -15px
    margin-right: 4px

  .exp-symbol-wrapper
    height: 74px
    padding-top: 5px
    text-align: center

  .exp-title
    border-top: 1px solid #cecece
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
