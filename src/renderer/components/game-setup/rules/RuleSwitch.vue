<template>
  <v-checkbox
    v-if="!readOnly"
    v-model="value"
    class="rule-switch"
    :label="rule.title"
    :disabled="!enabled"
    hide-details
    :color="theme === 'light' ? '#3E2723' : '#bbb'"
  />
  <span v-else class="ro-value"><v-icon>fas {{ value ? 'fa-check' : 'fa-times' }}</v-icon> {{ rule.title }}</span>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    setup: { type: Object, required: true },
    rule: { type: Object, required: true },
    enabled: { type: Boolean, default: true },
    readOnly: { type: Boolean, defaukt: false }
  },

  computed: {
    ...mapState({
      theme: state => state.settings.theme
    }),

    value: {
      get () {
        return this.setup.rules[this.rule.id]
      },

      set (value) {
        // bound directlu to gemaSetup action
        // not much clear, when setup values is no prop
        // but working hack as dispatching action is only handling for editable rule
        this.$store.dispatch('gameSetup/setRuleConfig', { id: this.rule.id, config: value })
      }
    }
  }
}
</script>

<style lang="sass">
.rule-switch

  &.v-input--selection-controls
    margin-top: 0

  .v-input--selection-controls__input
    margin-right: 15px
</style>
