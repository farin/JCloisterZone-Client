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

    <div v-if="sets.count" class="tile">
      <CountMiniboard :size="77" />
      <div class="count">1</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
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
</style>
