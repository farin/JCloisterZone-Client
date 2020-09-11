<template>
  <div>
    <ConfigSection title="Optional Game Mechanics">
      <div class="rules-section game-mechanics">
        <GameMechanicsBox :item="GameElement.FARMERS">
          <template #icon>
            <div class="farmers">
              <StandaloneTileImage tile-id="GQ/F" :size="55" />
              <svg class="meeple" :width="55" :height="55">
                <g transform="translate(27 27) scale(0.6) rotate(90) translate(-27 -27)">
                  <use :href="`${MEEPLES_SVG}#small-follower`" />
                </g>
              </svg>
            </div>
          </template>
          <template #description>Players are allowed to place followers on fields.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.GARDEN">
          <template #icon>
            <img src="~/assets/features/C1/garden.png" width="80" height="55">
          </template>
          <template #description>Can be occupied by an abbot.</template>
          <template #disabled>Abbot is not selected</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.CATHEDRAL">
          <template #icon>
            <img src="~/assets/features/C1/cathedral.png" height="55">
          </template>
          <template #description>Completed cities with cathedral x3 instead of x2, no points during final scoring.</template>
          <template #disabled>Inns &amp; Cathedrals expansion is not selected</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.INN">
          <template #icon>
            <img src="~/assets/features/C1/inn.png" width="80">
          </template>
          <template #description>Completed roads with inn x2, no points during final scoring.</template>
          <template #disabled>No tile with Inn is selected</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.PRINCESS">
          <template #icon>
            <img src="~/assets/features/C1/princess.png" height="42">
          </template>
          <template #description>Princess can remove knight from a city.</template>
          <template #disabled>Princess &amp; Dragon expansion is not selected</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.PORTAL">
          <template #icon>
            <img src="~/assets/features/C1/magic_portal.png" height="55">
          </template>
          <template #description>Through portal meeple can be placed on any tile.</template>
          <template #disabled>Princess &amp; Dragon expansion is not selected</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.BAZAAR">
          <template #icon>
            <img src="~/assets/features/C1/bazaar.png" height="55">
          </template>
          <template #description>Land tiles are auctioned when bazaar comes into play.</template>
          <template #disabled>Bridges, Castles and Bazaars expansion is not selected</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.HILL">
          <template #icon>
            <img src="~/assets/features/C1/hill.png" height="55">
          </template>
          <template #description>Used as tiebreaker. Also hides one random tile under it.</template>
          <template #disabled>Hills and Sheep expansion is not selected</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.VINEYARD">
          <template #icon>
            <img src="~/assets/features/C1/vineyard.png" height="55">
          </template>
          <template #description>Additional points for nearby cloisters.</template>
          <template #disabled>Hills and Sheep expansion is not selected</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.PIG_HERD">
          <template #icon>
            <img src="~/assets/features/C1/pig_herd.jpg" height="55">
          </template>
          <template #description>Counts as additional pig on field (farmers scores more points).</template>
          <template #disabled>Neither GQ11 nor River II is selected.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.SHRINE">
          <template #icon>
            <img src="~/assets/features/C1/shrine.jpg" height="55">
          </template>
          <template #description>Shrine placed next to cloister compete who finish feature first. (second gets no points)</template>
          <template #disabled>The Cult expansion is not in the game.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.FESTIVAL">
          <template #icon>
            <img src="~/assets/features/C1/festival.png" height="55">
          </template>
          <template #description>With festival tile you can return one of your own meeples instead of placing one.</template>
          <template #disabled>Festival expansion is not in the game.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.ESCAPE">
          <template #icon>
            <img src="~/assets/features/C1/escape.png" height="55">
          </template>
          <template #description>Espace allowed via a&nbsp;neighboring cloister.</template>
          <template #disabled>Siege expansion is not in the game.</template>
        </GameMechanicsBox>
      </div>
    </ConfigSection>

    <ConfigSection title="Gameplay Variants">
      <div class="rules-section other-rules">
        <RuleBox :item="Expansion.MONASTERIES">
          <template #icon>
            <ExpansionSymbol :expansion="Expansion.MONASTERIES" :size="45" />
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              Special monasteries <RuleSelect :rule="Rule.KEEP_MONASTERIES" :enabled="selected" long />.
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="GameElement.PIG_HERD">
          <template #icon>
            <StandaloneTileImage tile-id="GQ/F" :size="45" />
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              Field tile from Game Quarterly 11 expansion <RuleSelect :rule="Rule.GQ11_PIG_HERD" :enabled="selected" />.
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="GameElement.WAGON">
          <template #icon>
            <svg class="meeple" :width="45" :height="45">
              <use :href="`${MEEPLES_SVG}#wagon`" />
            </svg>
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              After scored, wagon can me moved to adjacent unoccupied, incomplete feature. Adjacent means:
              <RuleSelect :rule="Rule.WAGON_MOVE" :enabled="selected" xlong />.
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="GameElement.BARN">
          <template #icon>
            <svg class="meeple" :width="45" :height="45">
              <use :href="`${MEEPLES_SVG}#barn`" />
            </svg>
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              Barn <RuleSelect :rule="Rule.BARN_PLACEMENT" :enabled="selected" short /> be placed on a&nbsp;field already occupied by another barn.
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="GameElement.FAIRY">
          <template #icon>
            <NeutralFigure figure="fairy" :width="45" :height="45" />
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              The Fairy is deployed  <RuleSelect :rule="Rule.FAIRY_PLACEMENT" :enabled="selected" />.
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="GameElement.DRAGON">
          <template #icon>
            <NeutralFigure figure="dragon" :width="90" :height="45" />
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              Dragon movement occurs  <RuleSelect :rule="Rule.DRAGON_MOVEMENT" :enabled="selected" short /> scoring.
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="GameElement.PRINCESS">
          <template #icon>
            <img src="~/assets/features/C1/princess.png" height="35">
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              The Princess <RuleSelect :rule="Rule.PRINCESS_ACTION" :enabled="selected" short /> remove knight from a city.
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="GameElement.BAZAAR">
          <template #icon>
            <img src="~/assets/features/C1/bazaar.png" height="45">
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              <RuleSwitch :rule="Rule.BAZAAR_NO_AUCTION" :enabled="selected" />
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="GameElement.HILL">
          <template #icon>
            <img src="~/assets/features/C1/hill.png" height="45">
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              Tiebreaker method: <RuleSelect :rule="Rule.HILL_TIEBREAKER" :enabled="selected" /> on hills.
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="GameElement.FESTIVAL">
          <template #icon>
            <img src="~/assets/features/C1/festival.png" height="45">
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              Player may return one of one’s own <RuleSelect :rule="Rule.FESTIVAL_RETURN" :enabled="selected" />.
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="GameElement.ESCAPE">
          <template #icon>
            <img src="~/assets/features/C1/escape.png" height="45">
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              Cloister must be placed adjacent to <RuleSelect :rule="Rule.ESCAPE_VARIANT" :enabled="selected" /> of a&nbsp;besieged city to espace.
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="GameElement.TUNNEL">
          <template #icon>
            <ExpansionSymbol :expansion="Expansion.TUNNEL" :size="45" />
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              <RuleSwitch :rule="Rule.TUNNELIZE_OTHER_EXPANSIONS" :enabled="selected" />
            </div>
            <div class="rule-line">
              Assign <RuleSelect :rule="Rule.MORE_TUNNEL_TOKENS" :enabled="selected" short /> token sets to each player in game of two/three.
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="Expansion.LABYRINTH">
          <template #icon>
            <ExpansionSymbol :expansion="Expansion.LABYRINTH" :size="45" />
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              Play <RuleSelect :rule="Rule.LABYRINTH_VARIANT" :enabled="selected" short /> labyrinth variant.
            </div>
          </template>
        </RuleBox>
      </div>
    </ConfigSection>

    <ConfigSection title="Scoring Variants">
      <div class="rules-section other-rules">
        <RuleBox :item="GameElement.LITTLE_BUILDINGS">
          <template #icon>
            <img src="~/assets/figures/lb.png" width="45" height="45">
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              Assign <RuleSelect :rule="Rule.LITTLE_BUILDINGS_SCORING" :enabled="selected" short /> points for tower/house/shed.
            </div>
          </template>
        </RuleBox>

        <RuleBox :item="[GameElement.KING, GameElement.ROBBER]">
          <template #icon>
            <img src="~/assets/figures/king_robber.png" width="45" height="45">
          </template>
          <template #rules="{ selected }">
            <div class="rule-line">
              <!-- TODO hide at the end of the game if continuosly is selected -->
              Score <RuleSelect :rule="Rule.KING_AND_ROBBER_SCORING" :enabled="selected" xlong />
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
    </ConfigSection>

    <ConfigSection title="Starting tile(s) configuration">
      <StartingTiles />
    </ConfigSection>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { GameElement } from '@/models/elements'
import { Expansion } from '@/models/expansions'
import { Rule } from '@/models/rules'
import ConfigSection from '@/components/game-setup/ConfigSection'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import GameMechanicsBox from '@/components/game-setup/GameMechanicsBox'
import NeutralFigure from '@/components/game/NeutralFigure'
import RuleBox from '@/components/game-setup/RuleBox'
import RuleSelect from '@/components/game-setup/RuleSelect'
import RuleSwitch from '@/components/game-setup/RuleSwitch'
import StartingTiles from '@/components/game-setup/StartingTiles'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  components: {
    ConfigSection,
    ExpansionSymbol,
    GameMechanicsBox,
    NeutralFigure,
    RuleBox,
    RuleSelect,
    RuleSwitch,
    StartingTiles,
    StandaloneTileImage
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
    detail: state => state.gameSetup.detail,
    figures: state => state.gameSetup.figures,
    rules: state => state.gameSetup.rules
  })
}
</script>

<style lang="sass" scoped>
.rules-section
  flex: 1
  width: 100%
  padding-top: $panel-gap

  svg.meeple
    fill: #757575

  .selected
    svg.meeple
      fill: $selection-meeple

.game-mechanics
  display: grid
  width: 100%
  justify-content: center
  gap: $panel-gap
  grid-template-columns: repeat(auto-fill, 162px)
  grid-auto-flow: row

  .farmers
    position: relative
    height: 55px

    svg
      top: 0
      left: calc(50% - 27px)
      position: absolute

.other-rules
  display: grid
  gap: $panel-gap
  justify-content: center
  grid-template-columns: repeat(auto-fill, 670px)
  grid-auto-flow: row

  .selected
    svg.meeple, svg.tunnel-token
      fill: $selection-meeple

    svg.fairy
      position: relative
      top: -7px

    svg.exp-symbol
      fill: #333

  .unselected
    img
      filter: grayscale(100%)

</style>

<style lang="sass">
.options-rule
  .v-select, .v-label
    font-size: $rules-text-size

</style>
