<template>
  <component
    :is="clip.shape ? clip.shape : 'path'"
    v-bind="attrs"
  />
</template>

<script>
import pick from 'lodash/pick'

export default {
  props: {
    clip: { type: [String, Object], required: true }
  },

  computed: {
    attrs () {
      if (typeof this.clip === 'string') {
        return { d: this.clip }
      }
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
