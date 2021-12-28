<template>
  <g id="bridge-layer">
    <g
      v-for="bridge in bridges"
      :key="positionAsKey(bridge.position)"
      :transform="transformPosition(bridge.position)"
    >
      <path
        d="M 0 540 L 0 360 L 900 360 L 900 540 L 765 540 C 765 392 135 392 135 540 Z"
        :fill="fillColor(bridge)"
        :fill-opacity="0.75"
        :transform="bridge.location === 'NS' ? 'rotate(90 450 450)' : ''"
      />
    </g>
  </g>
</template>

<script>
import { mapState } from 'vuex'
import LayerMixin from '@/components/game/layers/LayerMixin'

export default {
  mixins: [LayerMixin],

  computed: mapState({
    emphasis: state => state.board.layers.EmphasizeLayer?.emphasis,
    theme: state => state.settings.theme
  }),

  methods: {
    fillColor (bridge) {
      if (this.theme === 'dark' && this.emphasis?.type === 'feature') {
        const emphasized = this.emphasis.places.find(({ location, tile }) => bridge.location === location && bridge.position[0] === tile.position[0] && bridge.position[1] === tile.position[1])
        if (emphasized) {
          return 'white'
        }
      }
      return 'black'
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
