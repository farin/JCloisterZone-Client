<template>
  <g id="wagon-phase-layer">
    <g
      :transform="transformPosition(origin.position)"
    >
      <polygon
        :points="wagonPolygon"
        fill="none"
        stroke="red"
        stroke-width="40"
        stroke-opacity="0.2"
      />
    </g>
  </g>
</template>

<script>
import { mapState } from 'vuex'

import LayerMixin from '@/components/game/layers/LayerMixin'

export default {
  components: {
  },

  mixins: [LayerMixin],

  props: {
    origin: { type: Object, required: true }
  },

  computed: {
    ...mapState({
      wagonRule: state => state.game.setup.rules['wagon-move']
    }),

    // featurePositons () {
    //   const { position, location } = this.origin
    //   const feature = this.$store.state.game.features.find(({ type, places }) => {
    //     return type !== 'Farm' && !!places.find(p => p[0] === position[0] && p[1] === position[1] && p[2] === location)
    //   })
    //   return feature?.places || []
    // },

    wagonPolygon () {
      console.log(this.$store.state.gameSetup.rules)
      if (this.wagonRule === 'C1') {
        // const { position, location } = this.origin
        // const feature = this.$store.state.game.features.find(({ type, places }) => {
        //   return type !== 'Farm' && !!places.find(p => p[0] === position[0] && p[1] === position[1] && p[2] === location)
        // })
        // TODO INSTEAD polygin render lines, XOR rectangle sides to get perimeter only
        return '-20,-20, 1020,-20, 1020,1020, -20,1020'
      } else {
        return '-1020,-1020 2020,-1020, 2020,2020 -1020,2020'
      }
    }
  },

  methods: {
  }
}
</script>

<style>
</style>
