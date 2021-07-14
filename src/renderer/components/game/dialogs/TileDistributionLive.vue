<template>
  <div class="tile-distribution-live">
    <div
      v-for="{id, count, remainingCount, rotation } in tiles"
      :key="id"
      class="tile"
      :class="{noleft: remainingCount === 0}"
    >
      <StandaloneTileImage
        :tile-id="id"
        :size="tileSize"
        :rotation="rotation"
        @click.native="$emit('tile-click', id)"
      />
      <div class="count">{{ remainingCount }} <span v-if="!availableOnly" class="total">/ {{ count }}</span></div>
    </div>

    <div v-if="sets.count && !availableOnly" class="tile noleft">
      <CountMiniboard :size="77" />
      <div class="count">1 <span class="total">/ 1</span></div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import countBy from 'lodash/countBy'

import StandaloneTileImage from '@/components/game/StandaloneTileImage'
import CountMiniboard from '@/components/game-setup/details/CountMiniboard'

import { getSelectedEdition, getSelectedStartingTiles } from '@/utils/gameSetupUtils'

export default {
  components: {
    StandaloneTileImage,
    CountMiniboard
  },

  props: {
    sets: { type: Object, required: true },
    rules: { type: Object, default: null },
    tileSize: { type: Number, default: 100 },
    availableOnly: { type: Boolean, default: false }
  },

  computed: {
    ...mapState({
      placedTiles: state => state.game.placedTiles,
      discardedTiles: state => state.game.discardedTiles,
      action: state => state.game.action,
      edition: state => getSelectedEdition(state.game.setup.elements),
      start: state => {
        const { elements, sets, start } = state.game.setup
        return getSelectedStartingTiles(elements, sets, start)
      }
    }),

    tiles () {
      let { sets } = this
      if (this.sets.count) {
        sets = { ...sets }
        delete sets.count
      }

      const counts = this.$tiles.getTilesCounts(sets, this.rules, this.edition, this.start)
      let tiles = Object.keys(counts).map(id => ({ id, ...this.$tiles.tiles[id] }))
      tiles.sort(this.$tiles.sortByEdge)

      const actionItem = this.action?.items[0]
      const drawnId = actionItem?.type === 'TilePlacement' ? actionItem.tileId : null
      const usedTiles = countBy(this.placedTiles, 'id')
      this.discardedTiles.forEach(id => {
        if (usedTiles[id]) {
          usedTiles[id] += 1
        } else {
          usedTiles[id] = 1
        }
      })

      tiles = tiles.map(t => {
        const themeTile = this.$theme.getTile(t.id)
        const count = counts[t.id]
        return {
          id: t.id,
          remainingCount: count - (usedTiles[t.id] || 0) - (drawnId === t.id ? 1 : 0),
          count,
          rotation: themeTile ? themeTile.rotation : 0
        }
      })

      if (this.availableOnly) {
        tiles = tiles.filter(t => t.remainingCount)
      }

      return tiles
    }
  }
}
</script>

<style lang="sass" scoped>
.tile-distribution-live
  display: flex
  flex-wrap: wrap
  justify-content: flex-start

  svg, .miniboard
    display: block
    margin: 0 2px

  .miniboard
    // height: 100px

  .count
    text-align: center
    padding: 4px 0
    margin-bottom: 10px
    font-weight: 300
    font-size: 26px

    .total
      font-size: 16px

  .tile.noleft
    filter: grayscale(100%)
</style>
