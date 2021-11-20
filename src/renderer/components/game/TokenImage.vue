<template>
  <component
    :is="tag"
    class="token-image"
    :class="classes"
    v-bind="attrs"
  >
    <use v-if="tag === 'svg'" :href="src" />
  </component>
</template>

<script>
import { mapGetters } from 'vuex'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

const TOKENS_SVG = require('~/assets/tokens.svg')

const TOKENS = {
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
  LB_TOWER: { tag: 'img', src: require('~/assets/figures/lb_tower.png') },
  BIGTOP_1: { tag: 'img', src: require('~/assets/figures/circus_1.png') },
  BIGTOP_3: { tag: 'img', src: require('~/assets/figures/circus_3.png') },
  BIGTOP_4: { tag: 'img', src: require('~/assets/figures/circus_4.png') },
  BIGTOP_5: { tag: 'img', src: require('~/assets/figures/circus_5.png') },
  BIGTOP_6: { tag: 'img', src: require('~/assets/figures/circus_6.png') },
  BIGTOP_7: { tag: 'img', src: require('~/assets/figures/circus_7.png') }
}

export default {
  components: {
    StandaloneTileImage
  },

  props: {
    token: { type: String, required: true },
    height: { type: Number, default: null },
    player: { type: Number, default: null },
    inactive: { type: Boolean }
  },

  computed: {
    ...mapGetters({
      tunnelTokenColorCssClass: 'game/tunnelTokenColorCssClass'
    }),

    tag () {
      if (this.token === 'ABBEY_TILE') {
        return StandaloneTileImage
      }
      return TOKENS[this.token].tag
    },

    src () {
      return TOKENS[this.token]?.src
    },

    classes () {
      // const cls = this.token.replace('_', '-').toLowerCase()
      const cls = 'token-' + this.token
      if (this.token.startsWith('TUNNEL')) {
        return cls + ' ' + this.tunnelTokenColorCssClass(this.token, this.player, this.inactive)
      }
      return cls
    },

    attrs () {
      if (this.token === 'ABBEY_TILE') {
        return {
          'tile-id': 'AM/A',
          'size': this.height
        }
      }
      const attrs = {}
      const t = TOKENS[this.token]
      if (t.tag === 'img') {
        attrs.src = t.src
        if (this.height) {
          Object.assign(attrs, { height: this.height })
        }
      } else if (t.tag === 'svg') {
        if (this.height) {
          Object.assign(attrs, { width: t.width * this.height, height: this.height })
        }
      }
      return attrs
    }
  }
}
</script>
