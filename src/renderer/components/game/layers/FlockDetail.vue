<template>
  <g id="flock-detail-layer">
    <!-- in rare case flock can be unset, eg deploying Shepherd on ferry tile, in time between ferry is set and sheep drawn -->
    <g v-if="flock">
      <rect
        :width="width" height="270"
        rx="30" ry="30"
        fill="#8bc75f" fill-opacity="0.85"
      />
      <text
        x="20" y="185"
        fill="white"
        :style="{ 'font-size': '154px', 'font-weight': 400 }"
      >
        {{ flockSize }}
      </text>
      <g
        v-for="(size, idx) in tokens"
        :key="idx"
        fill="white"
        :transform="`translate(${idx * 60 + tx} -15)`"
      >
        <circle
          v-for="i in size"
          :key="i"
          cx="0" :cy="60 * i" r="20"
        />
      </g>
    </g>
  </g>
</template>

<script>
import { mapState } from 'vuex'
import sum from 'lodash/sum'

import { isSameFeature } from '@/utils/gameUtils'

export default {
  props: {
    meeple: { type: Object, required: true }
  },

  computed: {
    ...mapState({
      flocks: state => state.game.sheep.flocks
    }),

    flock () {
      return this.flocks.find(f => isSameFeature(this.meeple, f))
    },

    tokens () {
      return this.flock.tokens.map(t => parseInt(t.replace('SHEEP_', '').replace('X', '')))
    },

    flockSize () {
      return sum(this.tokens)
    },

    tx () {
      return this.flockSize > 9 ? 260 : 170
    },

    width () {
      return this.tx + this.tokens.length * 60
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
