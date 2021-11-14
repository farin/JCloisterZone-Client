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
      let attrs = {}
      switch (this.clip.shape) {
      case 'circle': attrs = pick(this.clip, ['cx', 'cy', 'r']); break
      case 'ellipse': attrs = pick(this.clip, ['cx', 'cy', 'rx', 'ry']); break
      case 'path': attrs = pick(this.clip, ['d']); break
      }
      return attrs
    }
  }
}
</script>

=
