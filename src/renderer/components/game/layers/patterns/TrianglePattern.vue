<template>
  <pattern
    x="0" y="0" width="81" height="140.29611541307906"
    patternUnits="userSpaceOnUse"
    :patternTransform="patternTransform"
  >
    <g :class="player === null ? 'neutral-pattern' : colorCssClass(player) + ' color-fill'">
      <polygon points="0,0 81,0 40.5,70.14805770653953" />
      <polygon points="0,70.14805770653953 40.5,70.14805770653953 0,140.29611541307906" />
      <polygon points="40.5,70.14805770653953 81,70.14805770653953 81,140.29611541307906" />
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
