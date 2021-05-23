<template>
  <div v-if="loaded" class="theme-inspector">
    <div class="close">
      <NuxtLink to="/">Close</NuxtLink>
    </div>
    <v-container>
      <v-row align="center" class="header">
        <v-col cols="6">
          <v-select
            v-model="selected"
            :items="sets"
            item-text="title"
            item-value="id"
            label="Tiles"
            single-line
          />
        </v-col>
        <v-col cols="3">
          <v-select
            v-model="edition"
            :items="editions"
            label="Edition"
            single-line
          />
        </v-col>
        <v-col cols="3">
          <v-select
            v-model="size"
            :items="sizes"
            label="Size"
            single-line
          />
        </v-col>
      </v-row>
    </v-container>
    <template v-if="selected === 'count'">
      <div class="tile-row">
        <CountMiniboard :size="size" />
      </div>
    </template>
    <template v-else-if="selected">
      <div
        v-for="tile in tiles"
        :key="tile.id"
        class="tile-row"
      >
        <div class="tile-id">{{ tile.id }}</div>
        <StandaloneTileImage
          v-for="n in 4" :key="n"
          :tile-id="tile.id"
          :size="size"
          :padding="[0, 73]"
          :rotation="(n - 1) * 90"
        />
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Expansion } from '@/models/expansions'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'
import CountMiniboard from '@/components/game-setup/details/CountMiniboard'

export default {
  components: {
    StandaloneTileImage,
    CountMiniboard
  },

  data () {
    const sets = []
    for (const exp of Expansion.all()) {
      for (const release of exp.releases) {
        sets.push(...release.sets)
      }
    }
    return {
      selected: this.$store.state.loaded.tiles ? 'basic' : null,
      edition: 1,
      editions: [{ text: '1st edition', value: 1 }, { text: '2nd edition', value: 2 }],
      size: 240,
      sizes: [
        { text: '40', value: 40 },
        { text: '100', value: 100 },
        { text: '140', value: 140 },
        { text: '180', value: 180 },
        { text: '240', value: 240 },
        { text: '300', value: 300 }
      ],
      sets
    }
  },

  computed: {
    ...mapGetters({
      loaded: 'loaded'
    }),

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
.close
  position: absolute
  top: 10px
  right: 10px

.theme-inspector
  padding-bottom: 40px

.header
  margin-bottom: 40px

.tile-id
  width: 160px
  font-size: 20px
  text-align: right
  padding-right: 30px
  color: gray

.tile-row
  display: flex
  justify-content: center
  align-items: center
  margin-bottom: 15px

  svg
    margin: 0 5px
</style>
