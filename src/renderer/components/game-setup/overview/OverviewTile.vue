<template>
  <div
    class="element-box"
    :class="{ off: !enabled, titled: $slots.title }"
    :style="{ zIndex }"
  >
    <div class="symbol ico">
      <slot />
    </div>
    <div class="symbol name">
      <slot name="title" />
    </div>
    <slot name="quantity" />
  </div>
</template>

<script>
export default {
  props: {
    enabled: { type: Boolean },
    zIndex: { type: Number, default: 1 }
  }
}
</script>

<style lang="sass" scoped>
.element-box
  display: flex
  flex-direction: column
  align-items: center

  .symbol
    display: flex
    align-items: center
    justify-content: center

    svg
      +theme using ($theme)
        fill: map-get($theme, 'overview-tile-fill')

    svg.meeple, svg.neutral
      +theme using ($theme)
        fill: map-get($theme, 'overview-tile-meeple-fill')

  .quantity
    text-align: center
    font-size: 25px
    line-height: 1
    font-weight: 600

  .symbol.name
    display: none
    font-size: 13px
    font-weight: 500
    text-transform: uppercase
    text-align: center

  &.titled:hover
    .symbol.ico
      display: none

    .symbol.name
      display: flex

.element-box.off
  svg.meeple, svg.neutral
    +theme using ($theme)
      fill: map-get($theme, 'overview-tile-off-fill')
      color: map-get($theme, 'overview-tile-off-overlay')
</style>
