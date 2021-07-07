<template>
  <div class="addon-box">
    <h5>{{ addon.title || addon.id }}</h5>

    <div
      v-if="addon.removable"
      class="remove"
      @click="$addons.uninstall(addon)"
    >
      <v-icon>fas fa-trash</v-icon>
    </div>

    <div class="items">
      <div
        v-for="exp in addon.expansions"
        :key="exp.id"
        class="expansion"
      >
        <ExpansionSymbol :expansion="exp" />
      </div>

      <div
        v-for="artwork in addon.artworks"
        :key="artwork.id"
        class="artwork"
      >
        <img :src="artwork.json.icon">
      </div>
    </div>
  </div>
</template>

<script>
import ExpansionSymbol from '@/components/ExpansionSymbol'

export default {
  components: {
    ExpansionSymbol
  },

  props: {
    addon: { type: Object, required: true }
  },

  computed: {
  }
}
</script>

<style lang="sass" scoped>
.addon-box
  position: relative
  //display: flex
  padding: 16px
  margin-top: 10px

  +theme using ($theme)
    background: map-get($theme, 'board-bg')

  .remove
    position: absolute
    top: 16px
    right: 16px
    cursor: pointer

h5
  margin-bottom: 10px

.items
  display: flex

.expansion, .artwork
  margin-right: 4px

.expansion, .artwork img
  width: 48px
  height: 48px

.expansion
  svg
    +theme using ($theme)
      fill: map-get($theme, 'overview-tile-fill')
</style>
