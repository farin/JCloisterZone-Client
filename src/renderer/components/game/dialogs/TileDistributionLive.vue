<template>
  <div class="tile-distribution">
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
      <div class="count">{{ remainingCount }} <span class="total">/ {{ count }}</span></div>
    </div>

    <div v-if="sets.count" class="tile noleft">
      <CountMiniboard :tile-size="77" />
      <div class="count">1 <span class="total">/ 1</span></div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import countBy from 'lodash/countBy'

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
      action: state => state.game.action
    }),

    ...mapGetters({
      edition: 'gameSetup/getSelectedEdition',
      start: 'gameSetup/selectedStartingTiles'
    }),

    tiles () {
      function sortByEdge (a, b) {
        const ae = { c: 0, r: 0, i: 0 }
        const be = { c: 0, r: 0, i: 0 }
        a.edge.split('').forEach(ch => { ae[ch] += 1 })
        b.edge.split('').forEach(ch => { be[ch] += 1 })
        if (ae.i !== be.i) {
          return ae.i - be.i
        }
        if (ae.c !== be.c) {
          return be.c - ae.c
        }
        return ae.r - be.r // less roads first
      }

      let { sets } = this
      if (this.sets.count) {
        sets = { ...sets }
        delete sets.count
      }

      const counts = this.$tiles.getTilesCounts(sets, this.rules, this.edition, this.start)
      const tiles = Object.keys(counts).map(id => ({ id, ...this.$tiles.tiles[id] }))
      tiles.sort(sortByEdge)

      const actionItem = this.action?.items[0]
      const drawnId = actionItem.type === 'TilePlacement' ? actionItem.tileId : null
      const placedTiles = countBy(this.placedTiles, 'id')

      return tiles.map(t => {
        const themeTile = this.$theme.getTile(t.id)
        const count = counts[t.id]
        return {
          id: t.id,
          remainingCount: count - (placedTiles[t.id] || 0) - (drawnId === t.id ? 1 : 0),
          count,
          rotation: themeTile ? themeTile.rotation : 0
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
.tile-distribution
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
