<template>
  <div class="tile-distribution-live">
    <div
      v-for="{id, count, remainingCount, rotation, notSupported } in tiles"
      :key="id"
      class="tile"
      :class="{noleft: remainingCount === 0, disabled: notSupported }"
    >
      <StandaloneTileImage
        :tile-id="id"
        :size="tileSize"
        :rotation="rotation"
        @click.native="$emit('tile-click', id)"
      />
      <div class="count">{{ remainingCount }} <span class="total">/ {{ count }}</span></div>
    </div>

    <div v-if="sets.count" class="tile noleft">
      <CountMiniboard :size="77" />
      <div class="count">1 <span class="total">/ 1</span></div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import countBy from 'lodash/countBy'
import Vue from 'vue'

import StandaloneTileImage from '@/components/game/StandaloneTileImage'
import CountMiniboard from '@/components/game-setup/details/CountMiniboard'

export default {
  components: {
    StandaloneTileImage,
    CountMiniboard
  },

  props: {
    sets: { type: Object, required: true },
    rules: { type: Object, default: null },
    tileSize: { type: Number, default: 100 }
  },

  computed: {
    ...mapState({
      placedTiles: state => state.game.placedTiles,
      discardedTiles: state => state.game.discardedTiles,
      action: state => state.game.action
    }),

    ...mapGetters({
      edition: 'gameSetup/getSelectedEdition',
      start: 'gameSetup/selectedStartingTiles'
    }),

    tiles () {
      let { sets } = this
      if (this.sets.count) {
        sets = { ...sets }
        delete sets.count
      }

      const counts = this.$tiles.getTilesCounts(sets, this.rules, this.edition, this.start)
      const tiles = Object.keys(counts).map(id => ({ id, ...this.$tiles.tiles[id] }))
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

      return tiles.map(t => {
        const themeTile = this.$theme.getTile(t.id)
        const count = counts[t.id]
        return {
          id: t.id,
          remainingCount: count - (usedTiles[t.id] || 0) - (drawnId === t.id ? 1 : 0),
          count,
          rotation: themeTile ? themeTile.rotation : 0,
      	  notSupported: Vue.prototype.$tiles.tiles[t.id]?.notSupported || false
        }
      })
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
    
  .tile.disabled
    display: none

</style>
