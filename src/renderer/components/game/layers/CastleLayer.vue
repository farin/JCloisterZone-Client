<template>
  <g id="castle-layer">
    <g
      v-for="castle in castles"
      :key="positionAsKey(castle.positions[0]) + ',' + positionAsKey(castle.positions[1])"
      :transform="transformPosition(castle.positions[0])"
    >
      <image
        href="~/assets/figures/castle.png" :width="CASTLE_WIDTH" :height="CASTLE_HEIGHT"
        :transform="getTransformation(castle)"
      />
    </g>
  </g>
</template>

<script>
import { mapGetters } from 'vuex'

import LayerMixin from '@/components/game/layers/LayerMixin'
import { BASE_SIZE } from '@/constants/ui'

const CASTLE_WIDTH = 846
const CASTLE_HEIGHT = 684

export default {
  mixins: [LayerMixin],

  data () {
    return {
      CASTLE_WIDTH,
      CASTLE_HEIGHT
    }
  },

  computed: {
    ...mapGetters({
      castles: 'game/castles'
    })
  },

  methods: {
    getTransformation ({ positions }) {
      const w2 = ~~(CASTLE_WIDTH / 2)
      const h2 = ~~(CASTLE_HEIGHT / 2)
      if (positions[0][0] === positions[1][0]) { /// compare X
        // vertical
        return positions[0][1] < positions[1][1] ? `translate(${BASE_SIZE / 2 - w2}, ${BASE_SIZE - h2})` : `translate(${BASE_SIZE / 2 - w2}, ${-h2})`
      } else {
        // horizontla
        return (positions[0][0] < positions[1][0] ? `translate(${BASE_SIZE + h2}, ${BASE_SIZE / 2 - w2})` : `translate(${h2}, ${BASE_SIZE / 2 - w2})`) + ' rotate(90 0 0)'
      }
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
