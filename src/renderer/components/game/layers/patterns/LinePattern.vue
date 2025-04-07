<template>
  <pattern
    x="0" y="0" width="81" height="162"
    patternUnits="userSpaceOnUse"
    :patternTransform="patternTransform"
  >
    <g
      class="farm-hint-pattern"
      :class="player === null ? 'farm-hint-pattern-neutral' : colorCssClass(player) + ' color-fill'"
    >
      <rect width="81" height="81" />
    </g>
  </pattern>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    player: { type: Number, default: null },
    patternTransform: { type: String, required: true }
  },

  computed: mapGetters({
    colorCssClass: 'game/colorCssClass'
  })
}
</script>
