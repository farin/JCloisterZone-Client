<template>
  <v-checkbox
    v-model="value"
    class="rule-switch"
    :label="rule.title"
    :disabled="!enabled"
    hide-details
    color="#3E2723"
  />
</template>

<script>
export default {
  props: {
    rule: { type: Object, required: true },
    enabled: { type: Boolean, default: true }
  },

  computed: {
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
