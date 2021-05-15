<template>
  <svg class="exp-symbol" viewBox="0 0 100 100">
    <use v-if="!expansion.fan" :href="`${EXP_SYMBOL_SVG}#${expansion.name}`" />
    <g v-else>
      <rect x="4" y="4" width="92" height="92" rx="10" />
      <text
        x="50" y="52"
        dominant-baseline="middle" text-anchor="middle"
        style="font-size: 44px;"
      >{{ letters }}</text>
    </g>
  </svg>
</template>

<script>
const EXP_SYMBOL_SVG = require('~/assets/exp-symbols.svg')

export default {
  props: {
    expansion: { type: Object, required: true }
  },

  data () {
    return { EXP_SYMBOL_SVG }
  },

  computed: {
    letters () {
      const { name } = this.expansion
      const idx = name.indexOf(' ')
      if (idx === -1) {
        return name.substring(0, 2)
      } else {
        return name.charAt(0) + name.charAt(idx + 1)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
text
  +theme using ($theme)
    fill: map-get($theme, 'line-color')
</style>
