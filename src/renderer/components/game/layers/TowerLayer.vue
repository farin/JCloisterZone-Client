<template>
  <g id="tower-layer">
    <g
      v-for="({ height, tile, point, rotation }) in towerItems"
      :key="positionAsKey(tile.position)"
      :transform="`${transformPosition(tile.position)} ${transformRotation(rotation)} translate(${point[0]} ${point[1]}) rotate(${-rotation} 0 0)`"
    >
      <rect
        class="tower"
        x="-170" y="-140" width="340" height="280"
        stroke="black" stroke-width="40" stroke-opacity="0.8" stroke-dasharray="38"
        fill="black" fill-opacity="0.65"
      />
      <text x="-60" y="65" fill="white" style="font-size: 192px; font-weight: 600">{{ height }}</text>
    </g>
  </g>
</template>

<script>
import { mapState } from 'vuex'

import LayerMixin from '@/components/game/layers/LayerMixin'

export default {
  mixins: [LayerMixin],

  computed: {
    ...mapState({
      towers: state => state.game.features.filter(f => f.type === 'Tower' && f.height)
    }),

    towerItems () {
      return this.towers.map(t => {
        const { tile, point, rotation } = this.getTilePoint({ position: t.places[0], feature: 'Tower', location: 'I' })
        return {
          height: t.height,
          tile,
          point,
          rotation
        }
      })
    }
  }
}
</script>
