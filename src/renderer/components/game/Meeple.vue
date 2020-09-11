<template>
  <svg class="meeple">
    <use :href="`${MEEPLES_SVG}#${svgMeepleId}`" />
  </svg>
</template>

<script>
import { toKebabCase } from '@/utils/stringcase'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  props: {
    type: { type: String, required: true }
  },

  data () {
    return { MEEPLES_SVG }
  },

  computed: {
    svgMeepleId () {
      return toKebabCase(this.type)
    }
  }
}
</script>
