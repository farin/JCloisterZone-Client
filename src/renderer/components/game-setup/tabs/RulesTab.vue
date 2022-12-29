<template>
  <div :class="{'valid-only': showValidRulesOnly}">
    <div class="checkbox-wrapper">
      <v-switch
        v-model="showValidRulesOnly"
        dense
        hide-details
        :label="$t('core-messages.show-available-only')"
      />
    </div>

    <ConfigSection :title="$t('game-setup.rules.optional-game-mechanics')">
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
          <template #description>{{ $t('game-setup.rules.farmers-description') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.GARDEN">
          <template #icon>
            <img src="~/assets/features/C1/garden.png" width="80" height="55">
          </template>
          <template #description>{{ $t('game-setup.rules.garden-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.garden-disabled') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.CATHEDRAL">
          <template #icon>
            <img src="~/assets/features/C1/cathedral.png" height="55">
          </template>
          <template #description>{{ $t('game-setup.rules.cathedral-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.cathedral-disabled') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.INN">
          <template #icon>
            <img src="~/assets/features/C1/inn.png" width="80">
          </template>
          <template #description>{{ $t('game-setup.rules.inn-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.inn-disabled') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.PRINCESS">
          <template #icon>
            <img src="~/assets/features/C1/princess.png" height="42">
          </template>
          <template #description>{{ $t('game-setup.rules.princess-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.princess-disabled') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.PORTAL">
          <template #icon>
            <img src="~/assets/features/C1/magic_portal.png" height="55">
          </template>
          <template #description>{{ $t('game-setup.rules.portal-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.portal-disabled') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.BAZAAR">
          <template #icon>
            <img src="~/assets/features/C1/bazaar.png" height="55">
          </template>
          <template #description>{{ $t('game-setup.rules.bazaar-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.bazaar-disabled') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.HILL">
          <template #icon>
            <img src="~/assets/features/C1/hill.png" height="55">
          </template>
          <template #description>{{ $t('game-setup.rules.hill-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.hill-disabled') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.VINEYARD">
          <template #icon>
            <img src="~/assets/features/C1/vineyard.png" height="55">
          </template>
          <template #description>{{ $t('game-setup.rules.vineyard-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.vineyard-disabled') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.PIG_HERD">
          <template #icon>
            <img src="~/assets/features/C1/pig_herd.jpg" height="55">
          </template>
          <template #description>{{ $t('game-setup.rules.pig-herd-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.pig-herd-disabled') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.SHRINE">
          <template #icon>
            <img src="~/assets/features/C1/shrine.jpg" height="55">
          </template>
          <template #description>{{ $t('game-setup.rules.shrine-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.shrine-disabled') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.FESTIVAL">
          <template #icon>
            <img src="~/assets/features/C1/festival.png" height="55">
          </template>
          <template #description>{{ $t('game-setup.rules.festival-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.festival-disabled') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.SIEGE">
          <template #icon>
            <img src="~/assets/features/C1/siege.png" height="55">
          </template>
          <template #description>{{ $t('game-setup.rules.siege-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.siege-disabled') }}</template>
        </GameMechanicsBox>

        <GameMechanicsBox :item="GameElement.ESCAPE">
          <template #icon>
            <img src="~/assets/features/C1/escape.png" height="55">
          </template>
          <template #description>{{ $t('game-setup.rules.escape-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.escape-disabled') }}</template>
        </GameMechanicsBox>
        <GameMechanicsBox :item="GameElement.ACROBATS">
          <template #icon>
            <svg class="meeple" width="55" height="55">
              <g transform="scale(0.55)">
                <use :href="`${MEEPLES_SVG}#small-follower`" x="22" y="0" />
                <use :href="`${MEEPLES_SVG}#small-follower`" x="-1" y="41" />
                <use :href="`${MEEPLES_SVG}#small-follower`" x="46" y="41" />
              </g>
            </svg>
          </template>
          <template #description>{{ $t('game-setup.rules.acrobats-description') }}</template>
          <template #disabled>{{ $t('game-setup.rules.acrobats-disabled') }}</template>
        </GameMechanicsBox>
      </div>
    </ConfigSection>

    <ConfigSection :title="$t('game-setup.rules.gameplay-variants')">
      <GameplayVariants
        :setup="setup"
        class="rules-section other-rules"
        :show="showValidRulesOnly ? 'available' : 'all'"
      />
    </ConfigSection>

    <ConfigSection :title="$t('game-setup.rules.scoring-variants')">
      <ScoringVariants
        :setup="setup"
        class="rules-section other-rules"
        :show="showValidRulesOnly ? 'available' : 'all'"
      />
    </ConfigSection>

    <ConfigSection :title="$t('game-setup.rules.starting-tiles-configuration')">
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
import ScoringVariants from '@/components/game-setup/rules/ScoringVariants'
import StartingTiles from '@/components/game-setup/StartingTiles'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

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
      fill: map-get($theme, 'disabled-rules-fill')

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
