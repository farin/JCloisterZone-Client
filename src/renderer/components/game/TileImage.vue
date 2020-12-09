<template>
  <g :data-tile-id="tileId">
    <component
      :is="layer.tag"
      v-for="(layer, idx) in layers"
      :key="idx"
      v-bind="layer.props">{{ layer.content }}</component>
  </g>
</template>

<script>
export default {
  props: {
    tileId: { type: String, required: true },
    rotation: { type: Number, default: 0 }
  },

  computed: {
    layers () {
      return this.$theme.getTileLayers(this.tileId, this.rotation).layers
    }
  }
}
</script>
