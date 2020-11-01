<template>
  <g id="token-layer">
    <g
      v-for="({ player, token, places }) in tunnels"
      :key="`tunnel-${token}.${player}`"
      :class="tunnelTokenColorCssClass(token, player)"
    >
      <g
        v-for="(ptr, idx) in places"
        :key="idx"
        :transform="`${transformTunnelEnd(ptr)}`"
      >
        <use x="-210" y="-210" :width="340" :height="340" :href="TOKENS_SVG + '#tunnel'" />
      </g>
    </g>
    <g
      v-for="ferry in tokens.FERRY"
      :key="'ferry-' + positionAsKey(ferry.position)"
      :transform="transformPosition(ferry.position)"
    >
      <line
        x1="260" y1="500" x2="740" y2="500"
        stroke="white"
        stroke-width="100"
        stroke-dasharray="60 20"
        :transform="ferryTransform(ferry.location)"
      />
    </g>
    <g
      v-for="{ position, count } in tokens.GOLD"
      :key="'gold-' + positionAsKey(position)"
      :transform="transformPosition(position)"
    >
      <rect
        x="500"
        width="500"
        height="185"
        fill="black"
        fill-opacity="0.4"
      />
      <image
        x="510"
        href="~/assets/figures/gold.png"
        height="185"
      />
      <text
        x="875" y="145"
        fill="white"
        :style="{ 'font-size': '154px', 'font-weight': 500 }"
      >
        {{ count }}
      </text>
    </g>
    <g
      v-for=" position in tokens.LB_SHED"
      :key="'lb-shed-' + positionAsKey(position)"
      :transform="'translate(500 400) ' + transformPosition(position)"
    >
      <image href="~/assets/figures/lb_shed.png" transform="scale(1.2)" />
    </g>
    <g
      v-for=" position in tokens.LB_HOUSE"
      :key="'lb-house-' + positionAsKey(position)"
      :transform="'translate(500 400) ' + transformPosition(position)"
    >
      <image href="~/assets/figures/lb_house.png" transform="scale(1.2)" />
    </g>
    <g
      v-for=" position in tokens.LB_TOWER"
      :key="'lb-tower-' + positionAsKey(position)"
      :transform="'translate(500 400) ' + transformPosition(position)"
    >
      <image href="~/assets/figures/lb_tower.png" transform="scale(1.2)" />
    </g>
  </g>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import LayerMixin from '@/components/game/layers/LayerMixin'

const TOKENS_SVG = require('~/assets/tokens.svg')

export default {
  components: {
  },

  mixins: [LayerMixin],

  data () {
    return { TOKENS_SVG }
  },

  computed: {
    ...mapGetters({
      tunnelTokenColorCssClass: 'game/tunnelTokenColorCssClass'
    }),

    ...mapState({
      tokens: state => state.game.tokens
    }),

    tunnels () {
      return Object.keys(this.tokens).filter(k => k.startsWith('TUNNEL_')).map(k => {
        const [token, player] = k.split('.')
        return {
          player: parseInt(player),
          token,
          places: this.tokens[k]
        }
      })
    }
  },

  methods: {
    ferryTransform (location) {
      if (location === 'WE') return ''
      if (location === 'NS') return 'rotate(90 500 500)'
      if (location === 'NW') return 'translate(-140 -140) rotate(-45 500 500)'
      if (location === 'SW') return 'translate(-140 140) rotate(45 500 500)'
      if (location === 'NE') return 'translate(140 -140) rotate(45 500 500)'
      if (location === 'SE') return 'translate(140 140) rotate(-45 500 500)'
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
