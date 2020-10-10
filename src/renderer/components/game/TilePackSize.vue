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
  height: $action-bar-height

.v-icon, .size
  font-size: 42px

.size
  font-weight: bold
  margin-left: $panel-gap

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')
</style>
