<template>
  <svg :class="`neutral ${figure}` ">
    <use :href="`${NEUTRAL_SVG}#${figure === 'blackdragon' ? 'black-dragon' : figure}`" />
  </svg>
</template>

<script>
const NEUTRAL_SVG = require('~/assets/neutral.svg')

export default {

  props: {
    figure: { type: String, required: true }
  },

  data () {
    return {
      NEUTRAL_SVG
    }
  }
}
</script>
