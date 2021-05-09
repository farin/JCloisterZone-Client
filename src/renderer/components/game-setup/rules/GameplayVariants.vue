<template>
  <div
    :class="{
      ['show-' + show]: true,
      'read-only': readOnly
    }"
  >
    <RuleBox
      :setup="setup"
      :depends-on="Expansion.MONASTERIES"
      :rules="[Rule.KEEP_MONASTERIES]"
      :read-only="readOnly"
    >
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.MONASTERIES" />
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.PIG_HERD"
      :rules="[Rule.GQ11_PIG_HERD]"
      :read-only="readOnly"
    >
      <template #icon>
        <StandaloneTileImage tile-id="GQ/F" :size="45" />
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.WAGON"
      :rules="[Rule.WAGON_MOVE]"
      :read-only="readOnly"
    >
      <template #icon>
        <svg class="meeple" :width="45" :height="45">
          <use :href="`${MEEPLES_SVG}#wagon`" />
        </svg>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.BARN"
      :rules="[Rule.BARN_PLACEMENT]"
      :read-only="readOnly"
    >
      <template #icon>
        <svg class="meeple" :width="45" :height="45">
          <use :href="`${MEEPLES_SVG}#barn`" />
        </svg>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.FAIRY"
      :rules="[Rule.FAIRY_PLACEMENT]"
      :read-only="readOnly"
    >
      <template #icon>
        <NeutralFigure figure="fairy" :width="45" :height="45" />
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.DRAGON"
      :rules="[Rule.DRAGON_MOVEMENT]"
      :read-only="readOnly"
    >
      <template #icon>
        <NeutralFigure figure="dragon" :width="90" :height="45" />
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.PRINCESS"
      :rules="[Rule.PRINCESS_ACTION]"
      :read-only="readOnly"
    >
      <template #icon>
        <img src="~/assets/features/C1/princess.png" height="35">
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.BAZAAR"
      :rules="[Rule.BAZAAR_NO_AUCTION]"
      :read-only="readOnly"
    >
      <template #icon>
        <img src="~/assets/features/C1/bazaar.png" height="45">
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.HILL"
      :rules="[Rule.HILL_TIEBREAKER]"
      :read-only="readOnly"
    >
      <template #icon>
        <img src="~/assets/features/C1/hill.png" height="45">
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.FESTIVAL"
      :rules="[Rule.FESTIVAL_RETURN]"
      :read-only="readOnly"
    >
      <template #icon>
        <img src="~/assets/features/C1/festival.png" height="45">
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.ESCAPE"
      :rules="[Rule.ESCAPE_VARIANT]"
      :read-only="readOnly"
    >
      <template #icon>
        <img src="~/assets/features/C1/escape.png" height="45">
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.TUNNEL"
      :rules="[Rule.TUNNELIZE_OTHER_EXPANSIONS, Rule.MORE_TUNNEL_TOKENS]"
      :read-only="readOnly"
    >
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.TUNNEL" />
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="Expansion.COUNT"
      :rules="[Rule.COC_FINAL_SCORING, Rule.COUNT_MOVE]"
      :read-only="readOnly"
    >
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.COUNT" />
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="Expansion.LABYRINTH"
      :rules="[Rule.LABYRINTH_VARIANT]"
      :read-only="readOnly"
    >
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.LABYRINTH" />
      </template>
    </RuleBox>
  </div>
</template>

<script>
import { GameElement } from '@/models/elements'
import { Expansion } from '@/models/expansions'
import { Rule } from '@/models/rules'

import ExpansionSymbol from '@/components/ExpansionSymbol'
import NeutralFigure from '@/components/game/NeutralFigure'
import RuleBox from '@/components/game-setup/rules/RuleBox'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  components: {
    ExpansionSymbol,
    NeutralFigure,
    RuleBox,
    StandaloneTileImage
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
  }
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
