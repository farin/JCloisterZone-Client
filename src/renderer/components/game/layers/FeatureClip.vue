<template>
  <component :is="clip.shape" v-bind="attrs" />
</template>

<script>
import pick from 'lodash/pick'

export default {
  props: {
    clip: { type: Object, required: true }
  },

  computed: {
    attrs () {
      switch (this.clip.shape) {
      case 'circle': return pick(this.clip, ['cx', 'cy', 'r', 'fill-rule'])
      case 'ellipse': return pick(this.clip, ['cx', 'cy', 'rx', 'ry', 'fill-rule'])
      case 'path': return pick(this.clip, ['d', 'fill-rule'])
      }
      return {}
    }
  }
}
</script>
