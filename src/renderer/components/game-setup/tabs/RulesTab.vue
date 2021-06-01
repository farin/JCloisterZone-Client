<template>
  <div :class="{'valid-only': showValidRulesOnly}">
    <div class="checkbox-wrapper">
      <v-switch
        v-model="showValidRulesOnly"
        dense
        hide-details
        label="show available only"
      />
    </div>

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
          <template #disabled>Abbot is not selected.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.CATHEDRAL">
          <template #icon>
            <img src="~/assets/features/C1/cathedral.png" height="55">
          </template>
          <template #description>Completed cities with cathedral x3 instead of x2, no points during final scoring.</template>
          <template #disabled>Inns &amp; Cathedrals expansion is not selected.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.INN">
          <template #icon>
            <img src="~/assets/features/C1/inn.png" width="80">
          </template>
          <template #description>Completed roads with inn x2, no points during final scoring.</template>
          <template #disabled>No tile with Inn is in the game.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.PRINCESS">
          <template #icon>
            <img src="~/assets/features/C1/princess.png" height="42">
          </template>
          <template #description>Princess can remove knight from a city.</template>
          <template #disabled>Princess &amp; Dragon expansion is not selected.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.PORTAL">
          <template #icon>
            <img src="~/assets/features/C1/magic_portal.png" height="55">
          </template>
          <template #description>Through portal meeple can be placed on any tile.</template>
          <template #disabled>Princess &amp; Dragon expansion is not selected.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.BAZAAR">
          <template #icon>
            <img src="~/assets/features/C1/bazaar.png" height="55">
          </template>
          <template #description>Land tiles are auctioned when bazaar comes into play.</template>
          <template #disabled>Bridges, Castles and Bazaars expansion is not selected.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.HILL">
          <template #icon>
            <img src="~/assets/features/C1/hill.png" height="55">
          </template>
          <template #description>Used as tiebreaker. Also hides one random tile under it.</template>
          <template #disabled>Hills and Sheep expansion is not selected.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.VINEYARD">
          <template #icon>
            <img src="~/assets/features/C1/vineyard.png" height="55">
          </template>
          <template #description>Additional points for nearby cloisters.</template>
          <template #disabled>Hills and Sheep expansion is not selected.</template>
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
          <template #description>Shrine placed next to a monastery compete who finish feature first. (second gets no points)</template>
          <template #disabled>The Cult expansion is not in the game.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.FESTIVAL">
          <template #icon>
            <img src="~/assets/features/C1/festival.png" height="55">
          </template>
          <template #description>With festival tile you can return one of your own meeples instead of placing one.</template>
          <template #disabled>Festival expansion is not in the game.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.SIEGE">
          <template #icon>
            <img src="~/assets/features/C1/siege.png" height="55">
          </template>
          <template #description>Besieged cities are less valuable.</template>
          <template #disabled>Siege expansion is not in the game.</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.ESCAPE">
          <template #icon>
            <img src="~/assets/features/C1/escape.png" height="55">
          </template>
          <template #description>Espace allowed via a&nbsp;neighboring monastery.</template>
          <template #disabled>Siege expansion is not in the game.</template>
        </GameMechanicsBox>
      </div>
    </ConfigSection>

    <ConfigSection title="Gameplay Variants">
      <GameplayVariants
        :setup="setup"
        class="rules-section other-rules"
        :show="showValidRulesOnly ? 'available' : 'all'"
      />
    </ConfigSection>

    <ConfigSection title="Scoring Variants">
      <ScoringVariants
        :setup="setup"
        class="rules-section other-rules"
        :show="showValidRulesOnly ? 'available' : 'all'"
      />
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
import GameMechanicsBox from '@/components/game-setup/GameMechanicsBox'
import GameplayVariants from '@/components/game-setup/rules/GameplayVariants'
import StartingTiles from '@/components/game-setup/StartingTiles'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'
import ScoringVariants from '../rules/ScoringVariants'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  components: {
    ConfigSection,
    GameMechanicsBox,
    GameplayVariants,
    StartingTiles,
    StandaloneTileImage,
    ScoringVariants
  },

  data () {
    return {
      MEEPLES_SVG,
      Expansion,
      GameElement,
      Rule
    }
  },

  computed: {
    ...mapState({
      setup: state => state.gameSetup,
      detail: state => state.gameSetup.detail,
      figures: state => state.gameSetup.figures
    }),

    showValidRulesOnly: {
      get () { return this.$store.state.settings.showValidRulesOnly },
      set (val) { this.$store.dispatch('settings/update', { showValidRulesOnly: val }) }
    }
  }
}
</script>

<style lang="sass" scoped>
.rules-section
  flex: 1
  width: 100%
  padding-top: $panel-gap

  svg.meeple
    +theme using ($theme)
      fill: map-get($theme, 'disabled-fill')

  .selected
    svg.meeple
      +theme using ($theme)
        fill: map-get($theme, 'cards-selected-meeple')
        color: map-get($theme, 'cards-selected-meeple-overlay')

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
      +theme using ($theme)
        fill: map-get($theme, 'cards-selected-meeple')
        color: map-get($theme, 'cards-selected-meeple-overlay')

    svg.fairy
      position: relative
      top: -7px

    svg.exp-symbol
      fill: #333

  .unselected
    img
      filter: grayscale(100%)

.checkbox-wrapper
  display: flex
  justify-content: flex-end
  padding-right: 22px

.valid-only ::v-deep
  .game-mechanics-box.disabled:not(.available)
    display: none
</style>
