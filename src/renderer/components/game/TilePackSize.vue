<template>
  <section class="tile-pack-size">
    <v-icon>fas fa-layer-group</v-icon>
    <span class="size">{{ size }}</span>
    <div v-if="removedTilesSize" class="removed-tiles">
      <div class="ico-wrapper">
        <v-icon>fas fa-square</v-icon>
        <v-icon class="times">fas fa-times</v-icon>
      </div>
      <span>{{ removedTilesSize }}</span>
    </div>
  </section>
</template>

<script>
export default {
  props: {
    size: { type: Number, required: true },
    removedTilesSize: { type: Number, default: 0 }
  }
}
</script>

<style lang="sass" scoped>
section
  display: flex
  justify-content: center
  align-items: center
  position: relative

.v-icon, .size
  font-size: 42px

.size
  font-weight: bold
  margin-left: $panel-gap

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')

.removed-tiles
  position: absolute
  display: flex
  justify-content: center
  align-items: center
  right: 2px
  bottom: 2px

  .v-icon, span
    font-size: 24px

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')

  span
    font-weight: bold
    margin-left: 4px

  .ico-wrapper
    position: relative

    .times
      font-size: 16px
      position: absolute
      left: 5px
      top: 5.5px
      color: white !important
</style>
