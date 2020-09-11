<template>
  <div>
    <ConfigSection title="Followers">
      <div class="components">
        <GameElementBox :item="GameElement.SMALL_FOLLOWER" :mutable="false" :max="7">
          <svg class="meeple" :width="55" :height="55">
            <use :href="`${MEEPLES_SVG}#small-follower`" />
          </svg>
        </GameElementBox>
        <GameElementBox :item="GameElement.ABBOT">
          <svg class="meeple" :width="55" :height="55">
            <use :href="`${MEEPLES_SVG}#abbot`" />
          </svg>
        </GameElementBox>
        <GameElementBox :item="GameElement.PHANTOM">
          <svg class="meeple" :width="55" :height="55">
            <use :href="`${MEEPLES_SVG}#phantom`" />
          </svg>
        </GameElementBox>
        <GameElementBox :item="GameElement.BIG_FOLLOWER">
          <svg class="meeple" :width="55" :height="55">
            <use :href="`${MEEPLES_SVG}#big-follower`" />
          </svg>
        </GameElementBox>
        <GameElementBox :item="GameElement.BUILDER">
          <svg class="meeple" :width="55" :height="55">
            <use :href="`${MEEPLES_SVG}#builder`" />
          </svg>
        </GameElementBox>
        <GameElementBox :item="GameElement.PIG">
          <svg class="meeple" :width="55" :height="55">
            <use :href="`${MEEPLES_SVG}#pig`" />
          </svg>
        </GameElementBox>
        <GameElementBox :item="GameElement.MAYOR">
          <svg class="meeple" :width="55" :height="55">
            <use :href="`${MEEPLES_SVG}#mayor`" />
          </svg>
        </GameElementBox>
        <GameElementBox :item="GameElement.WAGON">
          <svg class="meeple" :width="55" :height="55">
            <use :href="`${MEEPLES_SVG}#wagon`" />
          </svg>
        </GameElementBox>
        <GameElementBox :item="GameElement.BARN">
          <svg class="meeple" :width="55" :height="55">
            <use :href="`${MEEPLES_SVG}#barn`" />
          </svg>
        </GameElementBox>
        <GameElementBox :item="GameElement.SHEPHERD">
          <svg class="meeple" :width="55" :height="55">
            <use :href="`${MEEPLES_SVG}#shepherd`" />
          </svg>
        </GameElementBox>
      </div>
    </ConfigSection>

    <ConfigSection title="Neutral Figures">
      <div class="components">
        <GameElementBox :item="GameElement.FAIRY">
          <NeutralFigure figure="fairy" :width="55" :height="55" />
        </GameElementBox>
        <GameElementBox :item="GameElement.DRAGON">
          <NeutralFigure figure="dragon" :width="110" :height="55" />
        </GameElementBox>
        <GameElementBox :item="GameElement.COUNT">
          <NeutralFigure figure="count" :width="55" :height="55" />
        </GameElementBox>
        <GameElementBox :item="GameElement.MAGE">
          <NeutralFigure figure="mage" :width="55" :height="55" />
        </GameElementBox>
        <GameElementBox :item="GameElement.WITCH">
          <NeutralFigure figure="witch" :width="55" :height="55" />
        </GameElementBox>
      </div>
    </ConfigSection>

    <ConfigSection title="Tokens">
      <div class="components">
        <GameElementBox :item="GameElement.TOWER">
          <img src="~/assets/figures/tower-alt.png" height="55">
        </GameElementBox>
        <GameElementBox :item="GameElement.ABBEY">
          <StandaloneTileImage tile-id="AM/A" :size="55" />
        </GameElementBox>
        <GameElementBox :item="GameElement.BRIDGE">
          <img src="~/assets/figures/bridge-alt.png" height="55">
        </GameElementBox>
        <GameElementBox :item="GameElement.CASTLE">
          <img src="~/assets/figures/castle.png" width="66" height="55">
        </GameElementBox>
        <GameElementBox :item="GameElement.TUNNEL" :mutable="false">
          <svg class="token tunnel-token" :width="55" :height="55">
            <use :href="TOKENS_SVG + '#tunnel'" />
          </svg>
        </GameElementBox>
        <GameElementBox :item="GameElement.FERRY" :mutable="false">
          <div class="icon-wrapper">
            <img src="~/assets/figures/ferry.png" height="30">
          </div>
        </GameElementBox>
        <GameElementBox :item="GameElement.LITTLE_BUILDINGS">
          <img src="~/assets/figures/lb.png" width="55" height="55">
        </GameElementBox>
      </div>
    </ConfigSection>

    <ConfigSection title="Rewards">
      <div class="components">
        <GameElementBox :item="GameElement.TRADERS">
          <div class="icon-wrapper">
            <img src="~/assets/figures/trade.png" height="45">
          </div>
        </GameElementBox>
        <GameElementBox :item="GameElement.KING">
          <img src="~/assets/figures/king.png" width="55" height="55">
        </GameElementBox>
        <GameElementBox :item="GameElement.ROBBER">
          <img src="~/assets/figures/robber.png" width="55" height="55">
        </GameElementBox>
        <GameElementBox :item="GameElement.GOLD">
          <div class="icon-wrapper">
            <img src="~/assets/figures/gold.png" height="40">
          </div>
        </GameElementBox>
      </div>
    </ConfigSection>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ConfigSection from '@/components/game-setup/ConfigSection'
import { GameElement } from '@/models/elements'
import GameElementBox from '@/components/game-setup/GameElementBox'
import NeutralFigure from '@/components/game/NeutralFigure'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

const MEEPLES_SVG = require('~/assets/meeples.svg')
const TOKENS_SVG = require('~/assets/tokens.svg')

export default {
  components: {
    ConfigSection,
    GameElementBox,
    NeutralFigure,
    StandaloneTileImage
  },

  data () {
    return {
      MEEPLES_SVG,
      TOKENS_SVG,
      GameElement
    }
  },

  computed: mapState({
    detail: state => state.gameSetup.detail,
    figures: state => state.gameSetup.figures
  })
}
</script>

<style lang="sass" scoped>
.components
  flex: 1
  margin-top: $panel-gap
  display: grid
  width: 100%
  justify-content: center
  gap: $panel-gap
  grid-template-columns: repeat(auto-fill, 162px)
  grid-auto-flow: row

  svg.meeple, svg.tunnel-token
    color: white

  svg.meeple, svg.neutral, svg.token
    fill: #757575

  .selected
    svg.meeple, svg.tunnel-token
      fill: $selection-meeple

    svg.fairy
      fill: $fairy-color

    svg.dragon
      fill: $dragon-color

    svg.count
      fill: $count-color

    svg.mage
      fill: $mage-color

    svg.witch
      fill: $witch-color

    svg.wooden-token
      fill: $wooden-token-color

.icon-wrapper
  height: 55px
  display: flex
  align-items: center
  justify-content: center
</style>
