<template>
  <div
    :class="{
      'rule-box': true,
      'available': available,
      'unavailable': !available,
      'default-value': defaultValue,
    }"
  >
    <div class="rule-icon">
      <slot name="icon" />
    </div>
    <div class="rule-lines">
      <RuleLine
        v-for="rule in rules"
        :key="rule.id"
        :setup="setup"
        :rule="rule"
        :available="available"
        :read-only="readOnly"
      />
    </div>
  </div>
</template>

<script>
import { GameElement } from '@/models/elements'
import { Expansion } from '@/models/expansions'
import RuleLine from '@/components/game-setup/rules/RuleLine'

export default {
  components: {
    RuleLine
  },

  props: {
    setup: { type: Object, required: true },
    dependsOn: { type: [Object, Array], default: null },
    rules: { type: Array, required: true },
    readOnly: { type: Boolean, defaukt: false }
  },

  computed: {
    defaultValue () {
      return this.rules.every(r => r.default === this.setup.rules[r.id])
    },

    available () {
      if (this.dependsOn === null) {
        return true
      }

      const isItemAvailable = item => {
        if (item instanceof GameElement) {
          return !!this.setup.elements[item.id]
        }
        if (item instanceof Expansion) {
          return item.sets.reduce((acc, set) => acc || !!this.setup.sets[set.id], false)
        }
        console.error(item)
        throw new Error('Invalid type')
      }

      if (Array.isArray(this.dependsOn)) {
        return this.dependsOn.reduce((acc, val) => acc || isItemAvailable(val), false)
      } else {
        return isItemAvailable(this.dependsOn)
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
    color: map-get($theme, 'cards-text')
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
    flex-shrink: 0

  .v-select
    margin: 0 5px

  &.unavailable
    opacity: $rules-disabled-opacity
    background: transparent

  ::v-deep .exp-symbol
    width: 45px
    height: 45px
</style>
