<template>
  <section class="tile-pack-size">
    <v-icon>fas fa-layer-group</v-icon>
    <span class="size">{{ size }}</span>
  </section>
</template>

<script>
export default {
  props: {
    size: { type: Number, required: true }
  }
}
</script>

<style lang="sass" scoped>
section
  display: flex
  justify-content: center
  align-items: center
  background: $bg-opaque
  height: $action-bar-height

.v-icon, .size
  font-size: 42px

.size
  font-weight: bold
  color: $color-gray
  margin-left: $panel-gap
</style>
