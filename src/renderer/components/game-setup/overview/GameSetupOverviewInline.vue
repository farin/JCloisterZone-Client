<template>
  <div class="game-setup-overview-inline">
    <OverviewTileSetTile
      v-for="{ expansion, set, quantity } in tileSets"
      :key="'s' + set.id"
      :expansion="expansion"
      :set="set"
      :quantity="quantity"
    />
    <div v-if="additions.length" class="section-delimiter">
      <v-icon>fas fa-plus</v-icon>
    </div>
    <OverviewElementTile
      v-for="([element, value]) in additions"
      :key="'a' + element"
      :element="element"
      :value="value"
      :small="small"
    />
    <div v-if="removals.length" class="section-delimiter">
      <v-icon>fas fa-minus</v-icon>
    </div>
    <OverviewElementTile
      v-for="([element, value]) in removals"
      :key="'r' + element"
      :element="element"
      :value="value"
      :small="small"
    />
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
    small: { type: Boolean }
  },
}
</script>

<style lang="sass" scoped>
.game-setup-overview-inline
  display: flex
  flex-wrap: wrap

  .element-box
    width: 50px
    height: 66px
    margin: 0.5px

    ::v-deep
      .symbol
        height: 50px

        > *
          transform: scale(0.625)

      .quantity
        font-size: 16px

      .symbol.name
        font-size: 8px

.section-delimiter
  padding-top: 15px
  text-align: center
  width: 50px

  .v-icon
    font-size: 12px
</style>
