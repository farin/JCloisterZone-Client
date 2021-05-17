<template>
  <div
    :class="{
      'game-mechanics-box': true,
      'disabled': !enabled,
      'mandatory': mandatory,
      'selected': selected,
    }"
    @click.stop="toggle"
  >
    <div class="box-title">
      <slot name="icon" />
      <h3>{{ item.title }}</h3>
    </div>
    <div class="toggle">
      <v-icon v-if="selected">fas fa-check</v-icon>
      <div v-else-if="enabled" class="add-first">Set</div>
      <div v-else class="disabled-message">
        <slot name="disabled" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  components: {
  },

  props: {
    item: { type: Object, required: true },
    mutable: { type: Boolean, default: true }
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
  },

  methods: {
    toggle () {
      if (this.enabled && !this.mandatory) {
        this.$store.dispatch('gameSetup/setElementConfig', { id: this.item.id, config: !this.selected })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.game-mechanics-box
  display: flex
  flex-direction: column
  cursor: pointer

  +theme using ($theme)
    color: map-get($theme, 'cards-text')
    background-color: map-get($theme, 'cards-bg')

  .box-title
    text-align: center
    height: 136px
    padding: 24px 0 8px 0
    line-height: 1

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

  .toggle
    flex: 1
    display: flex
    flex-direction: column
    justify-content: center
    text-align: center
    min-height: 56px

    // TODO make mixin from it
    .add-first
      font-size: 16px
      text-transform: uppercase
      font-weight: 300

      +theme using ($theme)
        color: map-get($theme, 'gray-text-color')

    &:hover .add-first
      text-decoration: underline

      +theme using ($theme)
        color: map-get($theme, 'cards-link-hover')

  &.selected
    +theme using ($theme)
      background: map-get($theme, 'cards-selected-bg')
      box-shadow: map-get($theme, 'cards-selected-shadow')

    h3
      +theme using ($theme)
        color: map-get($theme, 'cards-selected-text')

    .box-title img
      opacity: 1
      filter: none
      display: block

  &.disabled
    background: transparent
    cursor: default

    .box-title
      opacity: $rules-disabled-opacity

    .toggle
      cursor: default
      border-color: rgba(0, 0, 0, 0.05)

  .disabled-message
    visibility: hidden
    font-size: 11px
    text-transform: uppercase
    font-weight: 400
    color: rgba(0, 0, 0, 0.5)

.game-mechanics-box:hover
  .disabled-message
    visibility: visible
</style>
