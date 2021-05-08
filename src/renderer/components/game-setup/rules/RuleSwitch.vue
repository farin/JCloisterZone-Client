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
        return this.$store.state.gameSetup.rules[this.rule.id]
      },

      set (value) {
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
