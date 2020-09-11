<template>
  <div>
    <ConfigSection title="Core sets">
      <div class="expansions">
        <ExpansionBox :expansion="Expansion.BASIC" />
        <ExpansionBox :expansion="Expansion.WINTER" />
      </div>
    </ConfigSection>

    <ConfigSection title="Major expansions">
      <div class="expansions">
        <ExpansionBox :expansion="Expansion.INNS_AND_CATHEDRALS" />
        <ExpansionBox :expansion="Expansion.TRADERS_AND_BUILDERS" />
        <ExpansionBox :expansion="Expansion.PRINCESS_AND_DRAGON" />
        <ExpansionBox :expansion="Expansion.TOWER" />
        <ExpansionBox :expansion="Expansion.ABBEY_AND_MAYOR" />
        <ExpansionBox :expansion="Expansion.BRIDGES_CASTLES_AND_BAZAARS" />
        <ExpansionBox :expansion="Expansion.HILLS_AND_SHEEP" />
      </div>
    </ConfigSection>

    <ConfigSection title="Minor expansions">
      <div class="expansions">
        <ExpansionBox :expansion="Expansion.KING_AND_ROBBER" />
        <ExpansionBox :expansion="Expansion.RIVER" />
        <ExpansionBox :expansion="Expansion.SIEGE" />
        <ExpansionBox :expansion="Expansion.COUNT" />
        <ExpansionBox :expansion="Expansion.GQ11" />
        <ExpansionBox :expansion="Expansion.CULT" />
        <ExpansionBox :expansion="Expansion.TUNNEL" />
        <ExpansionBox :expansion="Expansion.CORN_CIRCLES" />
        <ExpansionBox :expansion="Expansion.FESTIVAL" />
        <ExpansionBox :expansion="Expansion.WIND_ROSES" />
        <ExpansionBox :expansion="Expansion.MONASTERIES" />
        <ExpansionBox :expansion="Expansion.FLIER" />
        <ExpansionBox :expansion="Expansion.FERRIES" />
        <ExpansionBox :expansion="Expansion.GOLDMINES" />
        <ExpansionBox :expansion="Expansion.MAGE_AND_WITCH" />
      </div>
    </ConfigSection>

    <ConfigSection title="Promos">
      <div class="expansions">
        <ExpansionBox :expansion="Expansion.RUSSIAN_PROMOS" />
        <ExpansionBox :expansion="Expansion.DARMSTADT" />
        <ExpansionBox :expansion="Expansion.LABYRINTH" />
        <ExpansionBox :expansion="Expansion.SPIEL_DOCH" />
      </div>
    </ConfigSection>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ConfigSection from '@/components/game-setup/ConfigSection'
import { Expansion } from '@/models/expansions'
import ExpansionBox from '@/components/game-setup/ExpansionBox'

export default {
  components: {
    ConfigSection,
    ExpansionBox
  },

  data () {
    return {
      Expansion
    }
  },

  computed: mapState({
    detail: state => state.gameSetup.detail,
    sets: state => state.gameSetup.sets
  })
}
</script>

<style lang="sass" scoped>
.expansions
  flex: 1
  margin-top: $panel-gap
  display: grid
  width: 100%
  justify-content: center
  gap: $panel-gap
  grid-template-columns: repeat(auto-fill, 242px)
  grid-auto-flow: row

.exp-box.multiset
  grid-row-end: span 2
</style>
