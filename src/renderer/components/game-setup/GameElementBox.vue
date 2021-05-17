<template>
  <div
    :class="{
      'element-box': true,
      'disabled': !enabled,
      'mandatory': mandatory,
      'selected': selected,
    }"
  >
    <GameElementButtons
      :mutable="mutable && enabled"
      :item="item"
      :max="max"
    >
      <div class="box-title">
        <slot />
        <h3>{{ item.title }}</h3>
      </div>

      <template v-if="!enabled" #hover>
        <div class="text text-disabled">Related tiles<br>not selected</div>
      </template>

      <template v-else-if="mandatory" #hover>
        <div class="text text-mandatory">Mandatory for<br>selected tiles</div>
      </template>
    </GameElementButtons>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import GameElementButtons from '@/components/game-setup/buttons/GameElementButtons'

export default {
  components: {
    GameElementButtons
  },

  props: {
    item: { type: Object, required: true },
    mutable: { type: Boolean, default: true },
    max: { type: Number, default: 1 }
  },

  computed: {
    ...mapState({
      sets: state => state.gameSetup.sets,
      elements: state => state.gameSetup.elements
    }),

    enabled () {
      return this.$tiles.isElementEnabled(this.item, this.sets, this.elements)
    },

    mandatory () {
      return !this.mutable && this.enabled
    },

    selected () {
      return !!this.elements[this.item.id]
    }
  }
}
</script>

<style lang="sass" scoped>
.element-box
  display: flex
  flex-direction: column

  +theme using ($theme)
    color: map-get($theme, 'cards-text')
    background-color: map-get($theme, 'cards-bg')

  ::v-deep .box-title
    text-align: center
    height: 136px
    padding: 24px 0 8px 0

    h3
      font-size: 1.09em
      font-weight: 300
      margin-top: 16px

    img
      display: block
      opacity: 0.9
      filter: grayscale(100%)
      border: 0
      margin: 0 auto

  &.selected
    +theme using ($theme)
      background: map-get($theme, 'cards-selected-bg')
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15), 0 3px 10px 0 rgba(0, 0, 0, 0.10)

    h3
      +theme using ($theme)
        color: map-get($theme, 'cards-selected-text')

    ::v-deep .box-title img
      opacity: 1
      filter: none
      display: block

.element-box.disabled
  ::v-deep .box-title svg
    opacity: 0.16
</style>
