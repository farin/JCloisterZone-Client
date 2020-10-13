<template>
  <div class="one-square tile-discarded">
    <StandaloneTileImage
      :tile-id="ev.tile"
    />
    <v-icon>fas fa-slash</v-icon>
  </div>
</template>

<script>
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

export default {
  components: {
    StandaloneTileImage
  },

  props: {
    ev: { type: Object, required: true }
  }
}
</script>

<style lang="sass" scoped>
.tile-discarded
  position: relative

  i
    position: absolute
    left: -1px
    top: 2px
    font-size: 34px

    +theme using ($theme)
      color: map-get($theme, 'removed-color')
</style>
