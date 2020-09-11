<template>
  <g id="tile-layer">
    <defs>
      <template v-for="artwork in artworksWithBackground">
        <pattern
          :id="artwork.id + '/bg'"
          :key="artwork.id + '/bg'"
          :width="artwork.background.cols * 1000"
          :height="artwork.background.rows * 1000"
          :viewBox="`0 0 ${artwork.background.width} ${artwork.background.height}`"
          patternUnits="userSpaceOnUse"
        >
          <image :href="artwork.background.image" />
        </pattern>

        <clipPath
          :id="artwork.id + '/placed-tiles-clip'"
          :key="artwork.id + '/placed-tiles-clip'"
        >
          <rect
            v-for="({position: pos}) in tilesByArtwork[artwork.id]"
            :key="'clip-' + positionAsKey(pos)"
            width="1000"
            height="1000"
            :transform="transformPosition(pos)"
          />
        </clipPath>
      </template>
    </defs>

    <g v-if="!layers.TilePlacementLayer">
      <rect
        v-for="({position: pos}) in tiles"
        :key="'bg-' + positionAsKey(pos)"
        x="-80" y="-80"
        width="1160"
        height="1160"
        fill="white"
        :transform="transformPosition(pos)"
      />
    </g>

    <rect
      v-for="artwork in artworksWithBackground"
      :key="artwork.id + '/bg-rect'"
      :x="1000 * bounds.x"
      :y="1000 * bounds.y"
      :width="1000 * bounds.width"
      :height="1000 * bounds.height"
      :fill="`url(#${artwork.id}/bg)`"
      :clip-path="`url(#${artwork.id}/placed-tiles-clip)`"
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

    <TileImage
      v-for="({position: pos, rotation: rot, id}) in tiles"
      :key="positionAsKey(pos)"
      :transform="transformPosition(pos)"
      :tile-id="id"
      :rotation="rot"
    />

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
import { mapGetters, mapState } from 'vuex'

import LayerMixin from '@/components/game/layers/LayerMixin'
import TileImage from '@/components/game/TileImage'

export default {
  components: {
    TileImage
  },

  mixins: [LayerMixin],

  computed: {
    ...mapState({
      tiles: state => state.game.placedTiles,
      layers: state => state.board.layers,
      playersCount: state => state.game.players.length,
      history: state => state.game.history
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
    },

    tilesByArtwork () {
      const res = {}
      this.tiles.forEach(t => {
        const { artwork } = this.$theme.getTile(t.id)
        let tiles = res[artwork.id]
        if (!tiles) {
          tiles = res[artwork.id] = []
        }
        tiles.push(t)
      })
      return res
    },

    artworksWithBackground () {
      return Object.keys(this.tilesByArtwork).map(id => this.$theme.getArtwork(id)).filter(artwork => artwork && artwork.background)
    }
  }
}
</script>

<style>
</style>
