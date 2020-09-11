<template>
  <div
    :class="{
      'element-box': true,
      'disabled': !enabled,
      'mandatory': mandatory,
      'selected': selected,
    }"
  >
    <div class="box-title">
      <slot />
      <h3>{{ item.title }}</h3>
    </div>
    <div class="box-controls">
      <div v-if="!enabled" class="text text-disabled">Related tiles<br>not selected</div>
      <GameElementButtons
        v-else
        :mutable="mutable"
        :item="item"
        :max="max"
      />

      <div v-if="mandatory" class="text text-mandatory">Mandatory for<br>selected tiles</div>
    </div>
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
      return this.item.isEnabled(this.sets, this.elements)
    },

    mandatory () {
      return !this.mutable && this.enabled
    },

    selected () {
      return !!this.elements[this.item.id]
    }
  },

  methods: {
    // open () {
    //   this.$store.commit('gameSetup/detail', { view: 'expansion', expansion: this.expansion })
    // }
  }
}
</script>

<style lang="sass" scoped>
.element-box
  display: flex
  flex-direction: column
  background: white

  .box-title
    text-align: center
    height: 136px
    padding: 24px 0 8px 0
    // display: flex
    // flex-direction: column
    // align-items: center

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

  .box-controls
    flex: 1
    display: flex
    flex-direction: column
    justify-content: center
    border-top: 1px solid #ddd
    min-height: 56px

  &.selected
    background: $selection-bg
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15), 0 3px 10px 0 rgba(0, 0, 0, 0.10)

    h3
      color: $selection-icon

    .box-title img
      opacity: 1
      filter: none
      display: block

.element-box.disabled
  .box-title svg
    opacity: 0.16

.box-controls
  .text
    display: none
    font-size: 12px
    text-transform: uppercase
    text-align: center
    font-weight: 300
    color: #777

.mandatory .box-controls:hover
  .quantity-buttons
    display: none

  .text-mandatory
    display: block

.box-controls:hover
  .text-disabled
    display: block

</style>
