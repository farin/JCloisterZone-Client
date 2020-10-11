<template>
  <div
    :class="{
      'rule-box': true,
      'selected': selected,
      'unselected': !selected,
    }"
  >
    <div class="rule-icon">
      <slot name="icon" />
    </div>
    <div class="rule-lines">
      <slot name="rules" :selected="selected" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { GameElement } from '@/models/elements'
import { Expansion } from '@/models/expansions'

export default {
  props: {
    item: { type: [Object, Array], default: null }
  },

  computed: {
    ...mapState({
      sets: state => state.gameSetup.sets,
      elements: state => state.gameSetup.elements
    }),

    selected () {
      if (this.item === null) {
        return true
      }

      const isItemSelected = item => {
        if (item instanceof GameElement) {
          return !!this.elements[item.id]
        }
        if (item instanceof Expansion) {
          return item.sets.reduce((acc, set) => acc || !!this.sets[set.id], false)
        }
        console.error(item)
        throw new Error('Invalid type')
      }

      if (Array.isArray(this.item)) {
        return this.item.reduce((acc, val) => acc || isItemSelected(val), false)
      } else {
        return isItemSelected(this.item)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.rule-box
  min-height: 75px
  padding: 10px 10px
  display: flex
  align-items: center

  +theme using ($theme)
    color: map-get($theme, 'cards-text-color')
    background: map-get($theme, 'cards-bg')

  .rule-lines
    .rule-line
      margin-top: 10px

    .rule-line:first-child
      margin-top: 0

  .rule-icon
    width: 80px
    margin-right: 20px
    align-self: stretch
    display: flex
    align-items: center
    justify-content: center

  .v-select
    margin: 0 5px

  &.unselected
    opacity: $rules-disabled-opacity
    background: transparent

  ::v-deep .exp-symbol
    width: 45px
    height: 45px
</style>
