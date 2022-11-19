<template>
  <pattern
    x="0" y="0" width="160" height="160"
    patternUnits="userSpaceOnUse"
    :patternTransform="patternTransform"
  >
    <g :class="player === null ? 'neutral-pattern' : colorCssClass(player) + ' color-fill'">
      <polygon points="0,0 120,0 120,80, 160,80 160,120 80,120 80,40 0,40" />
      <polygon points="0,80 40,80 40,160 0,160" />
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
