<template>
  <pattern
    x="0" y="0" width="200" height="200"
    patternUnits="userSpaceOnUse"
    :patternTransform="patternTransform"
  >
    <g :class="player === null ? 'neutral-pattern' : colorCssClass(player) + ' color-fill'">
      <rect x="0" width="100" height="100" y="0" />
      <rect x="100" width="100" height="100" y="100" />
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
