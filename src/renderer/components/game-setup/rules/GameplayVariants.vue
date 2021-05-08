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
    >
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.MONASTERIES" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Special monasteries <RuleSelect :setup="setup" :rule="Rule.KEEP_MONASTERIES" :enabled="available" long :read-only="readOnly" />.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.PIG_HERD"
      :rules="[Rule.GQ11_PIG_HERD]"
    >
      <template #icon>
        <StandaloneTileImage tile-id="GQ/F" :size="45" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Field tile from Game Quarterly 11 expansion <RuleSelect :setup="setup" :rule="Rule.GQ11_PIG_HERD" :enabled="available" :read-only="readOnly" />.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.WAGON"
      :rules="[Rule.WAGON_MOVE]"
    >
      <template #icon>
        <svg class="meeple" :width="45" :height="45">
          <use :href="`${MEEPLES_SVG}#wagon`" />
        </svg>
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          After scored, wagon can me moved to adjacent unoccupied, incomplete feature. Adjacent means:
          <RuleSelect :setup="setup" :rule="Rule.WAGON_MOVE" :enabled="available" xlong :read-only="readOnly" />.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.BARN"
      :rules="[Rule.BARN_PLACEMENT]"
    >
      <template #icon>
        <svg class="meeple" :width="45" :height="45">
          <use :href="`${MEEPLES_SVG}#barn`" />
        </svg>
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Barn <RuleSelect :setup="setup" :rule="Rule.BARN_PLACEMENT" :enabled="available" short :read-only="readOnly" /> be placed on a&nbsp;field already occupied by another barn.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.FAIRY"
      :rules="[Rule.FAIRY_PLACEMENT]"
    >
      <template #icon>
        <NeutralFigure figure="fairy" :width="45" :height="45" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          The Fairy is deployed <RuleSelect :setup="setup" :rule="Rule.FAIRY_PLACEMENT" :enabled="available" :read-only="readOnly" />.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.DRAGON"
      :rules="[Rule.DRAGON_MOVEMENT]"
    >
      <template #icon>
        <NeutralFigure figure="dragon" :width="90" :height="45" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Dragon movement occurs <RuleSelect :setup="setup" :rule="Rule.DRAGON_MOVEMENT" :enabled="available" short :read-only="readOnly" /> scoring.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.PRINCESS"
      :rules="[Rule.PRINCESS_ACTION]"
    >
      <template #icon>
        <img src="~/assets/features/C1/princess.png" height="35">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          The Princess <RuleSelect :setup="setup" :rule="Rule.PRINCESS_ACTION" :enabled="available" short :read-only="readOnly" /> remove knight from a city.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.BAZAAR"
      :rules="[Rule.BAZAAR_NO_AUCTION]"
    >
      <template #icon>
        <img src="~/assets/features/C1/bazaar.png" height="45">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          <RuleSwitch :setup="setup" :rule="Rule.BAZAAR_NO_AUCTION" :enabled="available" :read-only="readOnly" />
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.HILL"
      :rules="[Rule.HILL_TIEBREAKER]"
    >
      <template #icon>
        <img src="~/assets/features/C1/hill.png" height="45">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Tiebreaker method: <RuleSelect :setup="setup" :rule="Rule.HILL_TIEBREAKER" :enabled="available" :read-only="readOnly" /> on hills.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.FESTIVAL"
      :rules="[Rule.FESTIVAL_RETURN]"
    >
      <template #icon>
        <img src="~/assets/features/C1/festival.png" height="45">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Player may return one of one’s own <RuleSelect :setup="setup" :rule="Rule.FESTIVAL_RETURN" :enabled="available" :read-only="readOnly" />.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.ESCAPE"
      :rules="[Rule.ESCAPE_VARIANT]"
    >
      <template #icon>
        <img src="~/assets/features/C1/escape.png" height="45">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Cloister must be placed adjacent to <RuleSelect :setup="setup" :rule="Rule.ESCAPE_VARIANT" :enabled="available" :read-only="readOnly" /> of a&nbsp;besieged city to espace.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="GameElement.TUNNEL"
      :rules="[Rule.TUNNELIZE_OTHER_EXPANSIONS, Rule.MORE_TUNNEL_TOKENS]"
    >
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.TUNNEL" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          <RuleSwitch :setup="setup" :rule="Rule.TUNNELIZE_OTHER_EXPANSIONS" :enabled="available" :read-only="readOnly" />
        </div>
        <div class="rule-line">
          Assign <RuleSelect :setup="setup" :rule="Rule.MORE_TUNNEL_TOKENS" :enabled="available" short :read-only="readOnly" /> token sets to each player in game of two/three.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="Expansion.COUNT"
      :rules="[Rule.COC_FINAL_SCORING]"
    >
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.COUNT" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Moving meeples from the City of Carcassonne before final scoring <RuleSelect :setup="setup" :rule="Rule.COC_FINAL_SCORING" :enabled="available" xlong :read-only="readOnly" />.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="Expansion.COUNT"
      :rules="[Rule.COUNT_MOVE]"
    >
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.COUNT" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          When meeple is deployed to the City of C. then the Count is moved <RuleSelect :setup="setup" :rule="Rule.COUNT_MOVE" :enabled="available" long :read-only="readOnly" />.
        </div>
      </template>
    </RuleBox>

    <RuleBox
      :setup="setup"
      :depends-on="Expansion.LABYRINTH"
      :rules="[Rule.LABYRINTH_VARIANT]"
    >
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.LABYRINTH" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Play <RuleSelect :setup="setup" :rule="Rule.LABYRINTH_VARIANT" :enabled="available" short :read-only="readOnly" /> labyrinth variant.
        </div>
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
import RuleSelect from '@/components/game-setup/rules/RuleSelect'
import RuleSwitch from '@/components/game-setup/rules/RuleSwitch'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  components: {
    ExpansionSymbol,
    NeutralFigure,
    RuleBox,
    RuleSelect,
    RuleSwitch,
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
