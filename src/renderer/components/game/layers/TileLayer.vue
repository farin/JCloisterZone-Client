<template>
  <g id="tile-layer">
    <defs>
      <template v-for="({ artwork, positions }) in artworksWithBackground">
        <pattern
          :id="artwork.id + '/bg'"
          :key="artwork.id + '/bg'"
          :width="artwork.background.cols * 1000"
          :height="artwork.background.rows * 1000"
          :viewBox="`0 0 ${artwork.background.cols * artwork.tileSize} ${artwork.background.rows * artwork.tileSize}`"
          patternUnits="userSpaceOnUse"
        >
          <image :href="artwork.background.image" />
        </pattern>

        <mask
          :id="artwork.id + '/placed-tiles-clip'"
          :key="artwork.id + '/placed-tiles-clip'"
        >
          <rect
            v-for="pos in positions"
            :key="'clip-' + positionAsKey(pos)"
            width="1000"
            height="1000"
            fill="white"
            :transform="transformPosition(pos)"
            :opacity="tilePlacementMouseOver && tilePlacementMouseOver[0] === pos ? PREVIEW_OPACITY : 1"
          />
        </mask>
      </template>
    </defs>

    <g v-if="!layers.TilePlacementLayer">
      <rect
        v-for="({position: pos}) in tiles"
        :key="'bg-' + positionAsKey(pos)"
        class="tiles-border"
        x="-80" y="-80"
        width="1160"
        height="1160"
        :transform="transformPosition(pos)"
      />
    </g>

    <rect
      v-for="({ artwork }) in artworksWithBackground"
      :key="artwork.id + '/bg-rect'"
      :x="1000 * (bounds.x - 1)"
      :y="1000 * (bounds.y - 1)"
      :width="1000 * (bounds.width + 2)"
      :height="1000 * (bounds.height + 2)"
      :fill="`url(#${artwork.id}/bg)`"
      :mask="`url(#${artwork.id}/placed-tiles-clip)`"
    />

    <g
      v-for="({position: pos, player}) in lastPlacements"
      :key="'lp-' + positionAsKey(pos)"
      :class="colorCssClass(player)"
      :transform="transformPosition(pos)"
    >
      <g class="last-placement">
        <polygon points="0,0 -120,0 0,-120" />
        <polygon points="1000,1000 1120,1000 1000,1120" />
        <polygon points="1000,0 1120,0 1000,-120" />
        <polygon points="0,1000 0,1120 -120,1000" />
      </g>
    </g>

    <g
      v-for="bucket in layerBuckets"
      :key="bucket.id"
      :transform="bucket.transform"
      :opacity="bucket.opacity"
    >
      <component
        :is="layer.tag"
        v-for="(layer, idx) in bucket.layers"
        :key="idx"
        v-bind="layer.props"
      />
    </g>

    <g
      v-for="({ position: pos, player }) in lastPlacements"
      :key="'lp-over-' + positionAsKey(pos)"
      :class="colorCssClass(player)"
      :transform="transformPosition(pos)"
    >
      <g class="last-placement over">
        <polygon points="0,0 -120,0 0,-120" />
        <polygon points="1000,1000 1120,1000 1000,1120" />
        <polygon points="1000,0 1120,0 1000,-120" />
        <polygon points="0,1000 0,1120 -120,1000" />
      </g>
    </g>
  </g>
</template>

<script>
import sortBy from 'lodash/sortBy'
import { mapGetters, mapState } from 'vuex'

import LayerMixin from '@/components/game/layers/LayerMixin'
import TileImage from '@/components/game/TileImage'

const PREVIEW_OPACITY = 0.8

export default {
  components: {
    TileImage
  },

  mixins: [LayerMixin],

  data () {
    return {
      PREVIEW_OPACITY,
      artworks: {},
      artworksWithBackground: [],
      layerBuckets: []
    }
  },

  computed: {
    ...mapState({
      tiles: state => state.game.placedTiles,
      layers: state => state.board.layers,
      playersCount: state => state.game.players.length,
      history: state => state.game.history,
      tilePlacementMouseOver: state => state.board.tilePlacementMouseOver
    }),

    ...mapGetters({
      bounds: 'board/bounds'
    }),

    lastPlacements () {
      const placements = []
      for (let i = this.history.length - 1; i >= 0; i--) {
        const h = this.history[i]
        const ev = h.events.find(ev => ev.type === 'tile-placed')
        if (!ev) {
          continue
        }
        placements.push({
          position: ev.position,
          player: h.player
        })
        if (placements.length === this.playersCount) {
          break
        }
      }
      placements.reverse()
      return placements
    }
  },

  watch: {
    tiles (tiles) {
      this.onTilesChange(tiles)
    },

    tilePlacementMouseOver (val) {
      if (val) {
        const [position, rotation] = val
        const { tileId } = this.$store.state.board.layers.TilePlacementLayer
        this.onTilesChange([...this.tiles, { id: tileId, position, rotation }], position)
      } else {
        this.onTilesChange(this.tiles)
      }
    }
  },

  mounted () {
    this.onTilesChange(this.tiles)
  },

  methods: {
    onTilesChange (tiles, previewPosition) {
      const tileLayers = {}
      const artworks = {}
      for (const tile of sortBy(tiles, t => t.position[1] << 8 + t.position[0])) {
        const { artwork, layers } = this.$theme.getTileLayers(tile.id, tile.rotation)
        let artworkData = artworks[artwork.id]
        if (!artworkData) {
          artworkData = artworks[artwork.id] = {
            artwork: this.$theme.getArtwork(artwork.id),
            positions: []
          }
        }
        artworkData.positions.push(tile.position)

        for (const layer of layers) {
          let zval = tileLayers[layer.zindex]
          if (!zval) {
            zval = tileLayers[layer.zindex] = []
          }
          zval.push({ tile, artwork, layer })
        }

        // if (tile.position === previewPosition) {
        //   (tileLayers[99] = []).push({ tile, artwork, layer: { tag: 'rect', props: { x: 0, y: 0, width: 900, height: 900, fill: 'gray', opacity: '0.6' } } })
        // }
      }
      const zindexes = Object.keys(tileLayers).map(k => ~~k)
      zindexes.sort((a, b) => a - b)
      const buckets = []
      for (const z of zindexes) {
        let bucket = null
        for (const { tile, artwork, layer } of tileLayers[z]) {
          // positions can be compared as ref because equal positions must originate from same tile instance
          if (!bucket || tile.position !== bucket.position) {
            bucket = {
              id: `${this.positionAsKey(tile.position)}^${z}`,
              position: tile.position,
              transform: `${this.transformPosition(tile.position)} ${artwork.scaleTransform}`,
              layers: [],
              opacity: tile.position === previewPosition ? PREVIEW_OPACITY : 1
            }
            buckets.push(bucket)
          }
          bucket.layers.push(layer)
        }
      }
      this.layerBuckets = buckets
      this.artworks = Object.values(artworks)
      this.artworksWithBackground = this.artworks.filter(({ artwork }) => artwork.background)
    }
  }
}
</script>

<style lang="sass" scoped>
.tiles-border
  +theme using ($theme)
    fill: map-get($theme, 'cards-bg')
</style>
