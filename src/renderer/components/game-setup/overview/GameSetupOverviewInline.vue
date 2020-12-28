<template>
  <div class="game-setup-overview-inline" :class="sizeClass">
    <OverviewTileSetTile
      v-for="{ expansion, set, quantity } in tileSets"
      :key="'s' + set.id"
      :expansion="expansion"
      :set="set"
      :quantity="quantity"
    />
    <OverviewElementTile
      v-for="([element, value]) in additions"
      :key="'a' + element"
      :element="element"
      :value="value"
      :small="small"
    />
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
import GameSetupOverviewMixin from '@/components/game-setup/overview/GameSetupOverviewMixin'
import OverviewElementTile from '@/components/game-setup/overview/OverviewElementTile'
import OverviewTileSetTile from '@/components/game-setup/overview/OverviewTileSetTile'

export default {
  components: {
    OverviewElementTile,
    OverviewTileSetTile
  },

  mixins: [GameSetupOverviewMixin],

  props: {
    sets: { type: Object, required: true },
    elements: { type: Object, required: true },
    small: { type: Boolean }
  },

  computed: {
    sizeClass () {
      const size = this.configElementsSize
      if (size > 18) {
        return 'small'
      }
      return 'normal'
    }
  }
}
</script>

<style lang="sass" scoped>
.game-setup-overview-inline
  display: grid
  width: 360px
  grid-template-columns: repeat(6, 60px)
  grid-auto-rows: 80px

  .element-box
    margin: 0.5px
    width: 60px
    height: 80px

    ::v-deep
      .symbol
        height: 50px

        > *
          transform: scale(0.75)

      .quantity
        font-size: 18px

      .symbol.name
        font-size: 10px

.game-setup-overview-inline.small
  grid-template-columns: repeat(9, 40px)
  grid-auto-rows: 53px

  .element-box
    width: 40px
    height: 53px

    ::v-deep
      .symbol
        height: 40px

        > *
          transform: scale(0.5)

      .quantity
        font-size: 12px

      .symbol.name
        font-size: 7px

// .game-setup-overview-inline.size-6x1
//   grid-template-rows: repeat(1, 66px)
//   height: 66px

// .game-setup-overview-inline.size-6x2
//   grid-template-rows: repeat(2, 66px)
//   height: 132px

// .game-setup-overview-inline.size-6x2
//   grid-template-rows: repeat(3, 66px)
//   height: 198px

</style>
