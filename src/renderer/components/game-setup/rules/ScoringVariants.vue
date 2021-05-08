<template>
  <div>
    <RuleBox :depends-on="GameElement.LITTLE_BUILDINGS">
      <template #icon>
        <img src="~/assets/figures/lb.png" width="45" height="45">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Assign <RuleSelect :rule="Rule.LITTLE_BUILDINGS_SCORING" :enabled="available" short /> points for tower/house/shed.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="[GameElement.KING, GameElement.ROBBER]">
      <template #icon>
        <img src="~/assets/figures/king_robber.png" width="45" height="45">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          <!-- TODO hide at the end of the game if continuosly is selected -->
          Score <RuleSelect :rule="Rule.KING_AND_ROBBER_SCORING" :enabled="available" xlong />
          <span :style="{ opacity: rules['king-and-robber-scoring'] === 'continuously' ? 0.2 : 1 }"> at the end of the game.</span>
        </div>
      </template>
    </RuleBox>

    <RuleBox>
      <template #icon>
        <img src="~/assets/features/C1/tiny-city.png" width="45" height="45">
      </template>
      <template #rules>
        <div class="rule-line">
          Score tiny city for <RuleSelect :rule="Rule.TINY_CITY_SCORING" enabled short /> points.
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
