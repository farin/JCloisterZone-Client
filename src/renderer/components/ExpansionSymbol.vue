<template>
  <svg class="exp-symbol">
    <use :href="`${EXP_SYMBOL_SVG}#${expansion.name}`" />
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
  }
}
</script>
