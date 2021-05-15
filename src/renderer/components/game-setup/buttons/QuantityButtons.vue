<template>
  <div
    :class="{
      'quantity-buttons': true,
      'at-max': !canAdd,
      'switch': hasBooleanInterface,
      'mutable': mutable,
      'read-only': !mutable,
      'selected': value > 0,
      'with-hover-message': $slots.hover
    }"
    @click.stop="onClick"
  >
    <slot />
    <div class="controls">
      <template v-if="value">
        <span v-if="mutable" class="remove" @click.stop="removeOne">
          <v-icon>fas fa-minus</v-icon>
        </span>
        <span class="quantity">
          <v-icon v-if="value === 1 || value === true">fas fa-check</v-icon>
          <template v-else>{{ value }}</template>
        </span>
        <span v-if="mutable" class="add" title="Add multiple instances" @click.stop="add">
          <v-icon>fas fa-plus</v-icon>
        </span>
      </template>
      <template v-else-if="mutable">
        <div class="add-first">Add</div>
      </template>
    </div>

    <div v-if="$slots.hover" class="hover-message">
      <slot name="hover" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: { type: [Number, Boolean], required: true },
    max: { type: Number, required: true },
    mutable: { type: Boolean, default: true }
  },

  computed: {
    isBoolean () {
      return this.value === false || this.value === true
    },

    hasBooleanInterface () {
      return this.isBoolean || this.max === 1
    },

    canAdd () {
      if (this.isBoolean) {
        return this.value === false
      } else {
        return this.value < this.max
      }
    }
  },

  methods: {
    add () {
      if (this.mutable && this.canAdd) {
        this.$emit('input', this.isBoolean ? true : this.value + 1)
      }
    },

    removeAll () {
      if (this.mutable && this.value) {
        this.$emit('input', this.isBoolean ? false : 0)
      }
    },

    removeOne () {
      if (this.mutable && this.value > 0) {
        this.$emit('input', this.isBoolean ? false : this.value - 1)
      }
    },

    onClick () {
      if (this.value) {
        this.removeAll()
      } else {
        this.add()
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.controls
  height: 56px
  display: flex
  align-items: stretch

.hover-message
  height: 56px
  display: none
  align-items: center
  justify-content: center

  .text
    font-size: 12px
    text-transform: uppercase
    text-align: center
    font-weight: 300

    +theme using ($theme)
      color: map-get($theme, 'gray-text-color')

.add-first, .remove, .quantity, .add
  display: flex
  align-items: center
  justify-content: center

.quantity
  font-size: 24px
  font-weight: 500

  +theme using ($theme)
    color: map-get($theme, 'cards-selected-text')

  i
    +theme using ($theme)
        color: map-get($theme, 'cards-selected-text')

.add-first
  flex: 1
  font-size: 16px
  text-transform: uppercase
  font-weight: 300

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')

.remove, .quantity, .add
  flex: 1

.remove, .add
  visibility: hidden

  i
    +theme using ($theme)
      color: map-get($theme, 'cards-selected-text')

  &:hover i
    +theme using ($theme)
      color: map-get($theme, 'cards-selected-link-hover')

.hover-message
  display: none

.quantity-buttons
  &.mutable
    cursor: pointer

  &.read-only .quantity
    cursor: default

  &:hover
    .remove, .add
      visibility: visible

    .add-first
      text-decoration: underline

      +theme using ($theme)
        color: map-get($theme, 'cards-link-hover')

  &.with-hover-message:hover
    .controls
      display: none

    .hover-message
      display: flex

  &.at-max
    .add
      visibility: hidden

  &.switch
    .add, .remove
      visibility: hidden
</style>
