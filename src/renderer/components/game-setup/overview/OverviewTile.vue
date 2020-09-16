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
  background: white

  .symbol
    display: flex
    align-items: center
    justify-content: center

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
  background: #FFEBEE

  .symbol.ico
    opacity: 0.6

    svg
      fill: #FFEBEE

  .name
    text-decoration: line-through
    text-decoration-color: $removed-color
</style>

