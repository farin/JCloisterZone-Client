<template>
  <g id="flier-layer">
    <g
      v-if="ev"
      :transform="'translate(-114 -184) ' + transformPoint({ position: ev.flierPosition, feature: 'FlyingMachine', location: 'I' }) + ' scale(2.4)'"
    >
      <rect x="4" y="4" width="120" height="120" fill="black" fill-opacity="0.1" />
      <rect width="120" height="120" fill="white" stroke="#999" stroke-width="1" />
      <circle v-if="ev.distance === 1 || ev.distance === 3" cx="60" cy="60" r="12" />
      <circle v-if="ev.distance === 3" cx="90" cy="30" r="12" />
      <circle v-if="ev.distance === 3" cx="30" cy="90" r="12" />
      <circle v-if="ev.distance === 2" cx="40" cy="80" r="12" />
      <circle v-if="ev.distance === 2" cx="80" cy="40" r="12" />
    </g>
    <g
      v-if="ev && targetPosition"
    >
      <polygon
        :transform="transformPosition(targetPosition)"
        points="-20,-20, 1020,-20, 1020,1020, -20,1020"
        fill="none"
        stroke="red"
        stroke-width="40"
        stroke-opacity="0.2"
      />
    </g>
  </g>
</template>

<script>
// + 'translate(356 356) scale(2.4) '
import { mapGetters } from 'vuex'

import LayerMixin from '@/components/game/layers/LayerMixin'

export default {
  mixins: [LayerMixin],

  computed: {
    ...mapGetters({
      lastEvent: 'game/currentTurnLastEvent'
    }),

    ev () {
      return this.lastEvent && this.lastEvent.type === 'flier-roll' ? this.lastEvent : null
    },

    targetPosition () {
      const item = this.$store.state.game.action.items[0]
      if (!item) return null
      return item.options[0]?.position
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
