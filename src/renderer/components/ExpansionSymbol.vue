<template>
  <div>
    <template v-if="expansion.symbol">
      <img :src="expansion.symbol" :width="size" :height="size">
    </template>
    <template v-else>
      <svg class="exp-symbol" :width="size" :height="size">
        <use :href="`${EXP_SYMBOL_SVG}#${expansion.name}`" />
      </svg>
    </template>
  </div>
</template>

<script>
const EXP_SYMBOL_SVG = require('~/assets/exp-symbols.svg')

export default {
  props: {
    expansion: { type: Object, required: true },
    size: { type: Number, default: 55 }
  },

  data () {
    return { EXP_SYMBOL_SVG }
  }
}
</script>
