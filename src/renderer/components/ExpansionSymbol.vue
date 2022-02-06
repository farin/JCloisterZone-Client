<template>
  <svg class="exp-symbol" viewBox="0 0 100 100">
    <use v-if="!expansion.fan" :href="`${EXP_SYMBOL_SVG}#${expansion.name}`" />
    <use v-else-if="expansion.svgIcon" :href="`#expansion-${expansion.name}`" />
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
      const { title } = this.expansion
      if (!title) return '?'
      const words = title.toUpperCase().split(/\s+/).filter(w => w !== 'THE')
      if (words.length > 1) {
        return (words[0].charAt(0) + words[1].charAt(0))
      } else {
        return title.substring(0, 2).toUpperCase()
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
