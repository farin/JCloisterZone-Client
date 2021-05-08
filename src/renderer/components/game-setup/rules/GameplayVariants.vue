<template>
  <div>
    <RuleBox :depends-on="Expansion.MONASTERIES">
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.MONASTERIES" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Special monasteries <RuleSelect :rule="Rule.KEEP_MONASTERIES" :enabled="available" long />.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="GameElement.PIG_HERD">
      <template #icon>
        <StandaloneTileImage tile-id="GQ/F" :size="45" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Field tile from Game Quarterly 11 expansion <RuleSelect :rule="Rule.GQ11_PIG_HERD" :enabled="available" />.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="GameElement.WAGON">
      <template #icon>
        <svg class="meeple" :width="45" :height="45">
          <use :href="`${MEEPLES_SVG}#wagon`" />
        </svg>
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          After scored, wagon can me moved to adjacent unoccupied, incomplete feature. Adjacent means:
          <RuleSelect :rule="Rule.WAGON_MOVE" :enabled="available" xlong />.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="GameElement.BARN">
      <template #icon>
        <svg class="meeple" :width="45" :height="45">
          <use :href="`${MEEPLES_SVG}#barn`" />
        </svg>
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Barn <RuleSelect :rule="Rule.BARN_PLACEMENT" :enabled="available" short /> be placed on a&nbsp;field already occupied by another barn.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="GameElement.FAIRY">
      <template #icon>
        <NeutralFigure figure="fairy" :width="45" :height="45" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          The Fairy is deployed <RuleSelect :rule="Rule.FAIRY_PLACEMENT" :enabled="available" />.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="GameElement.DRAGON">
      <template #icon>
        <NeutralFigure figure="dragon" :width="90" :height="45" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Dragon movement occurs <RuleSelect :rule="Rule.DRAGON_MOVEMENT" :enabled="available" short /> scoring.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="GameElement.PRINCESS">
      <template #icon>
        <img src="~/assets/features/C1/princess.png" height="35">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          The Princess <RuleSelect :rule="Rule.PRINCESS_ACTION" :enabled="available" short /> remove knight from a city.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="GameElement.BAZAAR">
      <template #icon>
        <img src="~/assets/features/C1/bazaar.png" height="45">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          <RuleSwitch :rule="Rule.BAZAAR_NO_AUCTION" :enabled="available" />
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="GameElement.HILL">
      <template #icon>
        <img src="~/assets/features/C1/hill.png" height="45">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Tiebreaker method: <RuleSelect :rule="Rule.HILL_TIEBREAKER" :enabled="available" /> on hills.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="GameElement.FESTIVAL">
      <template #icon>
        <img src="~/assets/features/C1/festival.png" height="45">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Player may return one of one’s own <RuleSelect :rule="Rule.FESTIVAL_RETURN" :enabled="available" />.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="GameElement.ESCAPE">
      <template #icon>
        <img src="~/assets/features/C1/escape.png" height="45">
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Cloister must be placed adjacent to <RuleSelect :rule="Rule.ESCAPE_VARIANT" :enabled="available" /> of a&nbsp;besieged city to espace.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="GameElement.TUNNEL">
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.TUNNEL" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          <RuleSwitch :rule="Rule.TUNNELIZE_OTHER_EXPANSIONS" :enabled="available" />
        </div>
        <div class="rule-line">
          Assign <RuleSelect :rule="Rule.MORE_TUNNEL_TOKENS" :enabled="available" short /> token sets to each player in game of two/three.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="Expansion.COUNT">
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.COUNT" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Moving meeples from the City of Carcassonne before final scoring <RuleSelect :rule="Rule.COC_FINAL_SCORING" :enabled="available" xlong />.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="Expansion.COUNT">
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.COUNT" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          When meeple is deployed to the City of C. then the Count is moved <RuleSelect :rule="Rule.COUNT_MOVE" :enabled="available" long />.
        </div>
      </template>
    </RuleBox>

    <RuleBox :depends-on="Expansion.LABYRINTH">
      <template #icon>
        <ExpansionSymbol :expansion="Expansion.LABYRINTH" />
      </template>
      <template #rules="{ available }">
        <div class="rule-line">
          Play <RuleSelect :rule="Rule.LABYRINTH_VARIANT" :enabled="available" short /> labyrinth variant.
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
