<template>
  <div class="game-setup-grid view">
    <header>
      <slot name="header" />
    </header>

    <div class="detail-header">
      <slot name="detail-header" />
    </div>

    <main>
      <slot name="main" />
    </main>

    <aside>
      <slot name="detail" />
    </aside>
  </div>
</template>

<script>
export default {
}
</script>

<style lang="sass" scoped>

.game-setup-grid
  display: grid
  grid-template-columns: minmax(0, 1560px) minmax(372px, 1fr)
  grid-template-rows: $action-bar-height auto
  grid-template-areas: "header detail-header" "main detail"
  gap: $panel-gap

  +theme using ($theme)
    background: map-get($theme, 'board-bg')

header
  grid-area: header
  display: flex
  align-items: center
  justify-content: flex-end
  padding: 0 30px

  +theme using ($theme)
    background-color: map-get($theme, 'cards-bg')
    color: map-get($theme, 'gray-text-color')

  .tabs
    flex: 1

  .v-btn
    margin-left: $button-gap

  .tile-pack-size
    margin: 0 20px 0 40px

  .text
    font-size: 20px
    font-weight: 300

.detail-header
  grid-area: detail-header
  display: flex
  align-items: center
  justify-content: center

  +theme using ($theme)
    background-color: map-get($theme, 'cards-bg')

  h2
    // style copied from v-tab
    font-size: 0.875rem
    font-weight: 500
    justify-content: center
    letter-spacing: 0.0892857143em
    line-height: normal
    text-transform: uppercase

main
  grid-area: main
  overflow-y: overlay
  padding-bottom: $panel-gap * 2

aside
  overflow-y: overlay

@media (max-width: 1164px)
  .game-setup-grid
    grid-template-columns: 1fr
    grid-template-rows: $action-bar-height auto $action-bar-height auto
    grid-template-areas: "header" "main" "detail-header" "detail"

</style>
