<template>
  <div
    :class="{
      ['show-' + show]: true,
      'read-only': readOnly
    }"
  >
    <RuleBox
      :setup="setup"
      :rules="[Rule.LITTLE_BUILDINGS_SCORING]"
      :read-only="readOnly"
    >
      <template #icon>
        <img src="~/assets/figures/lb.png" width="45" height="45">
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :rules="[Rule.KING_AND_ROBBER_SCORING]"
      :read-only="readOnly"
    >
      <template #icon>
        <img src="~/assets/figures/king_robber.png" width="45" height="45">
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :rules="[Rule.TINY_CITY_SCORING]"
      :read-only="readOnly"
    >
      <template #icon>
        <img src="~/assets/features/C1/tiny-city.png" width="45" height="45">
      </template>
    </RuleBox>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { GameElement } from '@/models/elements'
import { Expansion } from '@/models/expansions'
import { Rule } from '@/models/rules'

import RuleBox from '@/components/game-setup/rules/RuleBox'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  components: {
    RuleBox
  },

  props: {
    setup: { type: Object, required: true },
    show: { type: String, required: true }, // all, available, changed
    readOnly: { type: Boolean, defaukt: false }
  },

  data () {
    return {
      MEEPLES_SVG,
      Expansion,
      GameElement,
      Rule
    }
  },

  computed: mapState({
    rules: state => state.gameSetup.rules
  })
}
</script>

<style lang="sass" scoped>
.show-available, .show-changed
  .rule-box.unavailable
    display: none

.show-changed
  .rule-box.default-value
    display: none

.read-only
  filter: grayscale(1)
</style>
