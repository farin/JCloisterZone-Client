<template>
  <span class="token-image">
    <StandaloneTileImage
      v-if="token === 'ABBEY_TILE'"
      tile-id="AM/A"
      :size="height"
    />
    <svg v-else-if="attrs.tag === 'svg'" :width="attrs.width * height" :height="height" :class="tunnelTokenColorCssClass(token, player, inactive)">
      <use :href="attrs.src" />
    </svg>
    <img v-else-if="attrs.tag === 'img'" :src="attrs.src" :alt="token" :height="height">
  </span>
</template>

<script>
import { mapGetters } from 'vuex'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

const TOKENS_SVG = require('~/assets/tokens.svg')

const SOURCES = {
  TOWER_PIECE: { tag: 'svg', src: TOKENS_SVG + '#tower', width: 1.512 },
  BRIDGE: { tag: 'svg', src: TOKENS_SVG + '#bridge', width: 1.273 },
  TUNNEL_A: { tag: 'svg', src: TOKENS_SVG + '#tunnel', width: 1 },
  TUNNEL_B: { tag: 'svg', src: TOKENS_SVG + '#tunnel', width: 1 },
  TUNNEL_C: { tag: 'svg', src: TOKENS_SVG + '#tunnel', width: 1 },
  CASTLE: { tag: 'svg', src: TOKENS_SVG + '#castle', width: 1 },
  WINE: { tag: 'img', src: require('~/assets/figures/wine.png') },
  CLOTH: { tag: 'img', src: require('~/assets/figures/cloth.png') },
  GRAIN: { tag: 'img', src: require('~/assets/figures/grain.png') },
  KING: { tag: 'img', src: require('~/assets/figures/king.png') },
  ROBBER: { tag: 'img', src: require('~/assets/figures/robber.png') },
  SHEEP_1X: { tag: 'img', src: require('~/assets/figures/sheep_1x.png') },
  SHEEP_2X: { tag: 'img', src: require('~/assets/figures/sheep_2x.png') },
  SHEEP_3X: { tag: 'img', src: require('~/assets/figures/sheep_3x.png') },
  SHEEP_4X: { tag: 'img', src: require('~/assets/figures/sheep_4x.png') },
  WOLF: { tag: 'img', src: require('~/assets/figures/wolf.png') },
  FERRY: { tag: 'svg', src: TOKENS_SVG + '#ferry', width: 1 },
  GOLD: { tag: 'img', src: require('~/assets/figures/gold.png') },
  LB_HOUSE: { tag: 'img', src: require('~/assets/figures/lb_house.png') },
  LB_SHED: { tag: 'img', src: require('~/assets/figures/lb_shed.png') },
  LB_TOWER: { tag: 'img', src: require('~/assets/figures/lb_tower.png') }
}

export default {
  components: {
    StandaloneTileImage
  },

  props: {
    token: { type: String, required: true },
    height: { type: Number, required: true },
    player: { type: Number, default: null },
    inactive: { type: Boolean }
  },

  computed: {
    ...mapGetters({
      tunnelTokenColorCssClass: 'game/tunnelTokenColorCssClass'
    }),

    attrs () {
      return SOURCES[this.token]
    }
  }
}
</script>
