<template>
  <div
    :class="{
      ['show-' + show]: true,
      'read-only': readOnly
    }"
  >
    <RuleBox
      :setup="setup"
      :depends-on="GameElement.LITTLE_BUILDINGS"
      :rules="[Rule.LITTLE_BUILDINGS_SCORING]"
    >
      <template #icon>
        <img src="~/assets/figures/lb.png" width="45" height="45">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Assign <RuleSelect :setup="setup" :rule="Rule.LITTLE_BUILDINGS_SCORING" :enabled="available" short :read-only="readOnly" /> points for tower/house/shed.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="[GameElement.KING, GameElement.ROBBER]"
      :rules="[Rule.KING_AND_ROBBER_SCORING]"
    >
      <template #icon>
        <img src="~/assets/figures/king_robber.png" width="45" height="45">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          <!-- TODO hide at the end of the game if continuosly is selected -->
          Score <RuleSelect :setup="setup" :rule="Rule.KING_AND_ROBBER_SCORING" :enabled="available" xlong :read-only="readOnly" />
          <span :style="{ opacity: rules['king-and-robber-scoring'] === 'continuously' ? 0.2 : 1 }"> at the end of the game.</span>
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :rules="[Rule.TINY_CITY_SCORING]"
    >
      <template #icon>
        <img src="~/assets/features/C1/tiny-city.png" width="45" height="45">
      </template>
      <template #rules>
        <div class="rule-line">
          Score tiny city for <RuleSelect :setup="setup" :rule="Rule.TINY_CITY_SCORING" enabled short :read-only="readOnly" /> points.
        </div>
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
import RuleSelect from '@/components/game-setup/rules/RuleSelect'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  components: {
    RuleBox,
    RuleSelect
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
