<template>
  <div class="game-setup-overview-inline" :class="sizeClass">
    <OverviewTileSetTile
      v-for="({ expansion, id, title, quantity }, idx) in tileSets"
      :key="'s' + id"
      :expansion="expansion"
      :title="title"
      :quantity="quantity"
      :z-index="toZindex(idx)"
    />
    <OverviewElementTile
      v-for="([element, value], idx) in additions"
      :key="'a' + element"
      :element="element"
      :value="value"
      :z-index="toZindex(idx + tileSets.length)"
    />
    <OverviewElementTile
      v-for="([element, value], idx) in removals"
      :key="'r' + element"
      :element="element"
      :value="value"
      :z-index="toZindex(idx + tileSets.length + additions.length)"
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
      if (size > 6) {
        return 'small'
      }
      return 'normal'
    }
  },

  methods: {
    toZindex (idx) {
      const row = Math.floor(idx / 9)
      const div = idx % 9
      const rowIdx = div % 2 === 0 ? div / 2 : 5 + Math.floor(div / 2)
      return 99 - (row * 9 + rowIdx)
    }
  }
}
</script>

<style lang="sass" scoped>
.game-setup-overview-inline
  display: grid
  width: 360px
  grid-template-columns: repeat(6, 60px)
  grid-auto-rows: 70px

  .element-box
    width: 60px
    height: 70px

    ::v-deep
      .symbol
        height: 50px
        min-height: 50px // required for title

        > *
          transform: scale(0.75)

      .quantity
        display: inline-block
        padding: 4px
        color: white
        transform: translateY(-10px)
        border-radius: 2px
        font-size: 18px
        opacity: 0.9

        +theme using ($theme)
          background: map-get($theme, 'overview-tile-quantity')

          &.addition
            background: #009900

          &.removal
            background: #ef0000

      .symbol.name
        font-size: 10px

.game-setup-overview-inline.small
  grid-template-columns: repeat(9, 36px)
  grid-auto-rows: 40px
  padding-bottom: 30px

  .element-box
    grid-column-end: span 2

  .element-box:nth-child(9n+5)
    grid-column-end: span 1

  .element-box:nth-child(9n+6)
    grid-column-start: 2

// .game-setup-overview-inline.small
//   grid-template-columns: repeat(9, 36px)
//   grid-auto-rows: 80px
//   padding-bottom: 30px

//   .element-box:nth-child(9n+2),
//   .element-box:nth-child(9n+4),
//   .element-box:nth-child(9n+6),
//   .element-box:nth-child(9n+8)
//     transform: translateY(40px)
</style>
