<template>
  <div class="game-setup-overview">
    <section>
      <OverviewTileSetTile
        v-for="{ expansion, set, quantity } in tileSets"
        :key="set.id"
        :expansion="expansion"
        :set="set"
        :quantity="quantity"
      />
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
import ExpansionSymbol from '@/components/ExpansionSymbol'
import NeutralFigure from '@/components/game/NeutralFigure'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'
import GameSetupOverviewMixin from '@/components/game-setup/overview/GameSetupOverviewMixin'
import OverviewElementTile from '@/components/game-setup/overview/OverviewElementTile'
import OverviewTileSetTile from '@/components/game-setup/overview/OverviewTileSetTile'

export default {
  components: {
    ExpansionSymbol,
    NeutralFigure,
    StandaloneTileImage,
    OverviewElementTile,
    OverviewTileSetTile
  },

  mixins: [GameSetupOverviewMixin],

  props: {
    sets: { type: Object, required: true },
    elements: { type: Object, required: true },
  }
}
</script>

<style lang="sass" scoped>
section
  display: flex
  flex-wrap: wrap

  .element-box
    width: 80px
    height: 105px
    margin: 1.5px

    ::v-deep .symbol
      height: 80px

.section-delimiter
  text-align: center
  padding: 15px

  .v-icon
    +theme using ($theme)
      color: map-get($theme, 'text-color')
</style>
