<template>
  <div>
    <v-container>
      <v-row align="center" class="header">
        <v-col cols="8">
          <v-select
            v-model="selected"
            :items="sets"
            item-text="title"
            item-value="id"
            label="Tiles"
            single-line
          />
        </v-col>
        <v-col cols="4">
          <v-select
            v-model="edition"
            :items="editions"
            label="Edition"
            single-line
          />
        </v-col>
      </v-row>
      <template v-if="selected">
        <v-row
          v-for="tile in tiles"
          :key="tile.id"
          align="center"
        >
          <v-col cols="2">{{ tile.id }}</v-col>
          <v-col v-for="n in 4" :key="n" cols="2">
            <StandaloneTileImage
              :tile-id="tile.id"
              :size="140"
              :rotation="(n - 1) * 90"
            />
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>


<script>
import { Expansion } from '@/models/expansions'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

export default {
  components: {
    StandaloneTileImage
  },

  data () {
    const sets = []
    for (const exp of Expansion.all()) {
      sets.push(...exp.sets)
    }
    return {
      selected: 'basic',
      edition: 1,
      editions: [{ text: '1st edition', value: 1 }, { text: '2nd edition', value: 2 }],
      sets
    }
  },

  computed: {
    tiles () {
      const counts = this.$tiles.getTilesCounts({ [this.selected]: 1 }, {}, this.edition)
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
  },

  methods: {
  }
}
</script>

<style lang="sass" scoped>
.header
  margin-bottom: 40px

</style>
