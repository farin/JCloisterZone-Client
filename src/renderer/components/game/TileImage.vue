<template>
  <g :data-tile-id="tileId">
    <component
      :is="layer.tag"
      v-for="(layer, idx) in layers"
      :key="idx"
      v-bind="layer.props"
    />
    <text
      v-if="!layers.length"
      x="150"
      y="480"
      :style="{ 'font-size': '128px', 'fill': 'red' }"
    >
      {{ tileId }}
    </text>
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
      return this.$theme.getTileLayers(this.tileId, this.rotation)
    }
  }
}
</script>
