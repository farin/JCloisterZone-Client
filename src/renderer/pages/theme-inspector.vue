<template>
  <div v-if="loaded" class="theme-inspector">
    <header>
      <div class="close">
        <NuxtLink to="/">Close</NuxtLink>
      </div>
      <v-container>
        <div class="expansions">
          <div
            v-for="(r, idx) in releases"
            :key="idx"
            class="set"
            :class="{ selected: selected == r }"
            :title="r.title"
            @click="select(r)"
          >
            <ExpansionSymbol :expansion="r.expansion" />
          </div>
        </div>
        <div class="options">
          <div>
            Edition:
            <v-btn-toggle v-model="editionIdx" @change="onEditionChange">
              <v-btn>1st</v-btn>
              <v-btn>2nd</v-btn>
            </v-btn-toggle>
          </div>

          <div>
            Size:
            <v-btn-toggle v-model="sizeIdx" @change="onSizeChange">
              <v-btn v-for="s in sizes" :key="s">
                {{ s }}
              </v-btn>
            </v-btn-toggle>
          </div>

          <div>
            Mode:
            <v-btn-toggle v-model="modeIdx" @change="onModeChange">
              <v-btn>Tiles</v-btn>
              <v-btn>Strokes</v-btn>
              <v-btn>Shapes</v-btn>
              <v-btn>Meeples</v-btn>
            </v-btn-toggle>
          </div>
        </div>
      </v-container>
    </header>
    <template v-if="artworksLoaded">
      <h2>{{ selected.title }}</h2>
      <template v-if="selected === 'count'">
        <div class="tile-row">
          <CountMiniboard :size="size" />
        </div>
      </template>
      <template v-else>
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
          >
            <template v-if="modeIdx > 0" #default="{ tileSize, artwork }">
              <ThemeInspectorFeatures
                v-if="artwork"
                :tile-id="tile.id"
                :tile-size="tileSize"
                :rotation="(n - 1) * 90"
                :mode="[null, 'strokes', 'shapes', 'meeples'][modeIdx]"
                :artwork="artwork"
                @tooltip="ev => location = ev"
              />
            </template>
          </StandaloneTileImage>
        </div>
        <div v-show="location" class="location">{{ location }}</div>
      </template>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { Expansion } from '@/models/expansions'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'
import CountMiniboard from '@/components/game-setup/details/CountMiniboard'
import ThemeInspectorFeatures from '@/components/dev/ThemeInspectorFeatures'

export default {
  components: {
    ExpansionSymbol,
    StandaloneTileImage,
    CountMiniboard,
    ThemeInspectorFeatures
  },

  data () {
    const releases = []
    const r = localStorage.getItem('themeInspector.r')
    let selected = null
    for (const expansion of Expansion.all()) {
      for (const release of expansion.releases) {
        releases.push(release)
        if (release.title === r) {
          selected = release
        }
      }
    }

    const editionIdx = localStorage.getItem('themeInspector.edition')
    const modeIdx = localStorage.getItem('themeInspector.mode')
    const sizeIdx = localStorage.getItem('themeInspector.size')

    return {
      selected: selected || Expansion.BASIC.releases[0],
      editionIdx: editionIdx === null ? 1 : ~~editionIdx,
      sizeIdx: sizeIdx === null ? 4 : ~~sizeIdx,
      modeIdx: modeIdx === null ? 2 : ~~modeIdx,
      sizes: [40, 100, 140, 180, 240, 300],
      releases,
      location: null
    }
  },

  computed: {
    ...mapGetters({
      loaded: 'loaded'
    }),

    ...mapState({
      artworksLoaded: state => state.loaded.artworks
    }),

    size () {
      return this.sizes[this.sizeIdx]
    },

    tiles () {
      const sets = {}
      this.selected.sets.forEach(set => {
        sets[set] = 1
      })
      const counts = this.$tiles.getTilesCounts(sets, {}, this.editionIdx + 1)
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

  watch: {
    artworksLoaded (val) {
      if (val && !this.selected) {
        this.selected = Expansion.BASIC.releases[0]
      }
    }
  },

  methods: {
    showTooltip (loc) {
      this.location = loc
    },

    select (release) {
      this.selected = release
      localStorage.setItem('themeInspector.r', release.title)
    },

    onEditionChange () {
      localStorage.setItem('themeInspector.edition', this.editionIdx)
    },

    onSizeChange () {
      localStorage.setItem('themeInspector.size', this.sizeIdx)
    },

    onModeChange () {
      localStorage.setItem('themeInspector.mode', this.modeIdx)
    }
  }
}
</script>

<style lang="sass" scoped>
header
  position: sticky
  top: 0

  +theme using ($theme)
    background: map-get($theme, 'cards-bg')
    border-bottom: 1px solid map-get($theme, 'line-color')

.close
  position: absolute
  top: 10px
  right: 10px

.expansions
  display: flex
  flex-wrap: wrap
  justify-content: center

  svg
    cursor: pointer
    width: 40px
    height: 40px
    margin: 2px

    +theme using ($theme)
      fill: map-get($theme, 'text-color')

  .selected svg
    // use theme to be more specific then ordinary color
    +theme using ($theme)
      fill: var(--v-primary-base)

.options
  margin-top: 10px
  display: flex
  justify-content: center
  gap: 40px

hr
  margin: 10px 0

h2
  margin-top: 10px
  text-align: center
  font-weight: 300

  +theme using ($theme)
    color: map-get($theme, 'text-color')

.theme-inspector
  padding-bottom: 40px

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

.location
  position: fixed
  left: 2px
  bottom: 2px
</style>
