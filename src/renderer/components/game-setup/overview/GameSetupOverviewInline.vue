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
      return ''
      // const size = this.configElementsSize
      // if (size <= 6) {
      //   return 'size-6x1'
      // }
      // if (size <= 12) {
      //   return 'size-6x2'
      // }
      // return 'size-6x3'
    }
  }
}
</script>

<style lang="sass" scoped>
.game-setup-overview-inline
  display: grid
  width: 300px
  grid-template-columns: repeat(6, 50px)
  grid-auto-rows: 66px

  .element-box
    margin: 0.5px
    width: 50px
    height: 66px

    ::v-deep
      .symbol
        height: 50px

        > *
          transform: scale(0.625)

      .quantity
        font-size: 16px

      .symbol.name
        font-size: 8px

// .game-setup-overview-inline.size-6x1
//   grid-template-rows: repeat(1, 66px)
//   height: 66px

// .game-setup-overview-inline.size-6x2
//   grid-template-rows: repeat(2, 66px)
//   height: 132px

// .game-setup-overview-inline.size-6x2
//   grid-template-rows: repeat(3, 66px)
//   height: 198px

.section-delimiter
  padding-top: 15px
  text-align: center
  width: 50px

  .v-icon
    font-size: 12px
</style>
