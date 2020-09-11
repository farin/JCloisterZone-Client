<template>
  <div
    :class="{
      'rule-select': true,
      short,
      long,
      xlong
    }"
  >
    <v-select
      v-model="value"
      :items="rule.values"
      :disabled="!enabled"
      dense
      hide-details
    />
  </div>
</template>

<script>
export default {
  props: {
    rule: { type: Object, required: true },
    enabled: { type: Boolean, default: true },
    short: { type: Boolean, default: false },
    long: { type: Boolean, default: false },
    xlong: { type: Boolean, default: false }
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
.rule-select
  display: inline-block
  width: 200px
  padding: 0 2px

  &.short
    width: 120px

  &.long
    width: 300px

  &.xlong
    width: 360px
</style>
