<template>
  <div class="game-setup-grid view">
    <header class="primary-header">
      <slot name="header" />
    </header>

    <header class="tiles-header">
      <TilePackSize :size="packSize" />
    </header>

    <main>
      <slot name="main" />
    </main>

    <aside>
      <slot name="detail" />
    </aside>
  </div>
</template>

<script>
import TilePackSize from '@/components/game/TilePackSize'

export default {
  components: {
    TilePackSize
  },

  props: {
    sets: { type: Object, required: true },
    rules: { type: Object, required: true }
  },

  computed: {
    packSize () {
      let size = 0
      let { sets } = this
      if (sets.count) {
        sets = { ...sets }
        delete sets.count
        size = 1
      }
      return size + this.$tiles.getPackSize(sets, this.rules)
    }
  }
}
</script>

<style lang="sass" scoped>
.game-setup-grid
  display: grid
  grid-template-columns: minmax(0, 1560px) minmax(372px, 1fr)
  grid-template-rows: var(--game-setup-header-height) auto
  grid-template-areas: "header tiles-header" "main detail"

  +theme using ($theme)
    background: map-get($theme, 'board-bg')

  ::v-deep .tile-pack-size
    .v-icon, .size
      font-size: 36px !important

header
  display: flex
  position: sticky
  top: 0
  z-index: 99

  +theme using ($theme)
    background-color: map-get($theme, 'cards-bg')
    color: map-get($theme, 'gray-text-color')
    border-bottom: 2px solid map-get($theme, 'board-bg')

  .text
    font-size: 20px
    font-weight: 300

.primary-header
  grid-area: header
  align-items: center
  justify-content: flex-end
  padding: 0 30px

  .tabs
    flex: 1

  .v-btn
    margin-left: $button-gap

.tiles-header
  grid-area: tiles-header
  align-items: center
  justify-content: flex-start
  padding-left: 30px

main
  grid-area: main
  overflow-y: overlay
  padding-bottom: $panel-gap * 2
  margin-right: $panel-gap
  margin-top: -2px

aside
  overflow-y: overlay
  margin-top: -2px

@media (max-width: 1164px)
  .game-setup-grid
    grid-template-columns: 1fr
    grid-template-rows: var(--game-setup-header-height) auto var(--game-setup-header-height) auto
    grid-template-areas: "header" "main" "tiles-header" "detail"

    .tiles-header
      position: static
      justify-content: center
      z-index: 0

@media (max-height: 768px)
  .game-setup-grid
    ::v-deep .tile-pack-size
      .v-icon, .size
        font-size: 28px !important
</style>
