<template>
  <div class="tile-distribution">
    <div
      v-for="{id, count, rotation } in tiles"
      :key="id"
      class="tile"
    >
      <StandaloneTileImage
        :tile-id="id"
        :size="tileSize"
        :rotation="rotation"
        @click.native="$emit('tile-click', id)"
      />
      <div class="count">{{ count }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

export default {
  components: {
    StandaloneTileImage
  },

  props: {
    sets: { type: Object, required: true },
    rules: { type: Object, default: null },
    tileSize: { type: Number, default: 100 }
  },

  computed: {
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

      const counts = this.$tiles.getTilesCounts(this.sets, this.rules, this.edition, this.start)
      const tiles = Object.keys(counts).map(id => ({ id, ...this.$tiles.tiles[id] }))
      tiles.sort(sortByEdge)

      return tiles.map(t => {
        const themeTile = this.$theme.getTile(t.id)
        return {
          id: t.id,
          count: counts[t.id],
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

  svg
    display: block
    margin: 0 2px

  .count
    //background: white
    text-align: center
    padding: 4px 0
    margin-bottom: 10px
    font-weight: 300
    font-size: 26px

</style>
