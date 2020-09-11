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
  grid-template-columns: minmax(0, 1560px) minmax(360px, 1fr)
  grid-template-rows: $action-bar-height auto
  grid-template-areas: "header detail-header" "main detail"
  gap: $panel-gap
  background: $bg-color

header
  grid-area: header
  display: flex
  align-items: center
  justify-content: flex-end
  color: $color-gray
  font-size: 36px
  padding: 0 30px
  background: white

  .tabs
    flex: 1

  .v-btn
    margin-left: $button-gap

  .tile-pack-size
    margin: 0 20px 0 40px

.detail-header
  grid-area: detail-header
  background: white
  display: flex
  align-items: center
  justify-content: center

  h2
    // style copied from v-tab
    font-size: 0.875rem
    font-weight: 500
    justify-content: center
    letter-spacing: 0.0892857143em
    line-height: normal
    text-transform: uppercase

  .exp-symbol
    display: block
    margin: 0px 20px
    fill: $color-gray

main
  grid-area: main
  overflow-y: overlay
  padding-bottom: $panel-gap * 2

aside
  overflow-y: overlay
</style>
