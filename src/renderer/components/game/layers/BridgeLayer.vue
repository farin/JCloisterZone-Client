<template>
  <g id="bridge-layer">
    <g
      v-for="bridge in bridges"
      :key="positionAsKey(bridge.position)"
      :transform="transformPosition(bridge.position)"
    >
      <path
        d="M 0 600 L 0 400 L 1000 400 L 1000 600 L 850 600 C 850 435 150 435 150 600 Z"
        :fill="fillColor(bridge)"
        :fill-opacity="0.75"
        :transform="bridge.location === 'NS' ? 'rotate(90 500 500)' : ''"
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
