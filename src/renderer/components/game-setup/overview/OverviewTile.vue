<template>
  <div
    class="element-box"
    :class="{off: !enabled, titled: $slots.title}"
  >
    <div class="symbol ico">
      <slot />
    </div>
    <div class="symbol name">
      <slot name="title"/>
    </div>
    <div v-if="quantity > 1" class="quantity">{{ quantity }}</div>
  </div>
</template>

<script>
export default {
  props: {
    enabled: { type: Boolean },
    quantity: { type: Number, default: 1 },
  }
}
</script>

<style lang="sass" scoped>
.element-box
  +theme using ($theme)
    background-color: map-get($theme, 'overview-tile-bg')
  .symbol
    display: flex
    align-items: center
    justify-content: center

    svg
      +theme using ($theme)
        fill: map-get($theme, 'overview-tile-fill')


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
  // background: #FFEBEE

  +theme using ($theme)
    background: map-get($theme, 'overview-tile-off-bg')

  // .symbol.ico
  //   opacity: 0.6

  svg
    +theme using ($theme)
      fill: map-get($theme, 'overview-tile-off-fill')
      color: map-get($theme, 'overview-tile-off-overlay')

  .name
    text-decoration: line-through

    +theme using ($theme)
      text-decoration-color: map-get($theme, 'removed-color')
</style>

