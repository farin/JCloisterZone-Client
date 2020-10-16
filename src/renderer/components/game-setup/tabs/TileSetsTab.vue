<template>
  <div>
    <ConfigSection title="Core sets">
      <div class="expansions">
        <ExpansionBox :expansion="Expansion.BASIC" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.WINTER" @open-detail="openDetail" />
      </div>
    </ConfigSection>

    <ConfigSection title="Major expansions">
      <div class="expansions">
        <ExpansionBox :expansion="Expansion.INNS_AND_CATHEDRALS" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.TRADERS_AND_BUILDERS" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.PRINCESS_AND_DRAGON" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.TOWER" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.ABBEY_AND_MAYOR" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.BRIDGES_CASTLES_AND_BAZAARS" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.HILLS_AND_SHEEP" @open-detail="openDetail" />
      </div>
    </ConfigSection>

    <ConfigSection title="Minor expansions">
      <div class="expansions">
        <ExpansionBox :expansion="Expansion.KING_AND_ROBBER" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.RIVER" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.SIEGE" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.COUNT" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.GQ11" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.CULT" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.TUNNEL" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.CORN_CIRCLES" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.FESTIVAL" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.WIND_ROSES" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.MONASTERIES" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.FLIER" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.FERRIES" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.GOLDMINES" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.MAGE_AND_WITCH" @open-detail="openDetail" />
      </div>
    </ConfigSection>

    <ConfigSection title="Promos">
      <div class="expansions">
        <ExpansionBox :expansion="Expansion.RUSSIAN_PROMOS" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.DARMSTADT" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.LABYRINTH" @open-detail="openDetail" />
        <ExpansionBox :expansion="Expansion.SPIEL_DOCH" @open-detail="openDetail" />
      </div>
    </ConfigSection>

    <ConfigSection title="Fan Expansions">
      <div class="expansions">
        <ExpansionBox :expansion="Expansion.FAN_WELLS" @open-detail="openDetail" />
      </div>
    </ConfigSection>

    <v-dialog
      v-model="detailOpen"
      max-width="800"
    >
      <ExpansionDetailDialog :expansion="detailExpansion" @close="detailOpen = false"/>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ConfigSection from '@/components/game-setup/ConfigSection'
import { Expansion } from '@/models/expansions'
import ExpansionBox from '@/components/game-setup/ExpansionBox'
import ExpansionDetailDialog from '@/components/game-setup/ExpansionDetailDialog'

export default {
  components: {
    ConfigSection,
    ExpansionBox,
    ExpansionDetailDialog
  },

  data () {
    return {
      Expansion,
      detailOpen: false,
      detailExpansion: null
    }
  },

  computed: mapState({
    sets: state => state.gameSetup.sets
  }),

  methods: {
    openDetail (exp) {
      this.detailExpansion = exp
      this.detailOpen = true
    }
  }
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
