<template>
  <div :class="{ 'rule-line': true, 'read-only': readOnly }">
    <RuleSwitch v-if="rule.values === Boolean" :setup="setup" :rule="rule" :enabled="available" :read-only="readOnly" />
    <template v-else>
      {{ titleParts[0] }}
      <RuleSelect
        :setup="setup"
        :rule="rule"
        :read-only="readOnly"
        :short="rule.options.style === 'short'"
        :long="rule.options.style === 'long'"
        :xlong="rule.options.style === 'xlong'"
      />
      <span :class="{'hidden-title': rule.options.hideTitleSuffixIfValueEquals === value}">{{ titleParts[1] }}</span>
    </template>
  </div>
</template>

<script>
import RuleSelect from '@/components/game-setup/rules/RuleSelect'
import RuleSwitch from '@/components/game-setup/rules/RuleSwitch'

export default {
  components: {
    RuleSelect,
    RuleSwitch
  },

  props: {
    setup: { type: Object, required: true },
    rule: { type: Object, required: true },
    available: { type: Boolean, default: true },
    readOnly: { type: Boolean, defaukt: false }
  },

  computed: {
    value () {
      return this.setup.rules[this.rule.id]
    },

    titleParts () {
      return this.$t(['game-setup.variant',this.rule.id,'description'].join('.')).split('{}')
    }
  }
}
</script>

<style lang="sass" scoped>
.hidden-title
  opacity: 0.2

.read-only .hidden-title
  display: none

</style>
