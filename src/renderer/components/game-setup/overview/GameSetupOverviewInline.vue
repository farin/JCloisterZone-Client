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
    />
    <OverviewElementTile
      v-for="([element, value]) in removals"
      :key="'r' + element"
      :element="element"
      :value="value"
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
    elements: { type: Object, required: true }
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
  grid-template-columns: repeat(9, 36px)
  grid-auto-rows: 80px
  padding-bottom: 30px

  .element-box
    ::v-deep
      .quantity
        display: inline-block
        padding: 4px
        background: var(--v-primary-base)
        color: white
        transform: translateY(-10px)
        border-radius: 2px

  .element-box:nth-child(9n+2),
  .element-box:nth-child(9n+4),
  .element-box:nth-child(9n+6),
  .element-box:nth-child(9n+8)
    transform: translateY(40px)
</style>
