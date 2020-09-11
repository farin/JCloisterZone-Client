<template>
  <g id="bridge-layer">
    <g
      v-for="bridge in bridges"
      :key="positionAsKey(bridge.position)"
      :transform="transformPosition(bridge.position)"
    >
      <path
        d="M 0 600 L 0 400 L 1000 400 L 1000 600 L 850 600 C 850 435 150 435 150 600 Z"
        fill="black"
        :fill-opacity="0.75"
        :transform="bridge.location === 'NS' ? 'rotate(90 500 500)' : ''"
      />
    </g>
  </g>
</template>

<script>
import LayerMixin from '@/components/game/layers/LayerMixin'

export default {
  mixins: [LayerMixin]
}
</script>

<style lang="sass" scoped>
</style>
