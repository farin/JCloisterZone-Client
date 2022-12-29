<template>
  <pattern
    x="0" y="0" width="81" :height="81 * (players.length + 1)"
    patternUnits="userSpaceOnUse"
    :patternTransform="patternTransform"
  >
    <rect
      v-for="(player, idx) in players"
      :key="player"
      x="0"
      :y="81 * idx"
      width="81" height="81"
      :class="colorCssClass(player) + ' color-fill farm-hint-pattern'"
    />
  </pattern>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    players: { type: Array, required: true },
    patternTransform: { type: String, required: true }
  },

  computed: mapGetters({
    colorCssClass: 'game/colorCssClass'
  })
}
</script>
