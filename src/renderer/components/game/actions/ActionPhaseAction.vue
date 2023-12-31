<template>
  <section :class="{
    local,
    [`size-${items.length}`]: true,
    'size-max': items.length > 14
  }">
    <div v-if="phase === 'CocFollowerPhase'" class="text-with-icons text-center">
      <v-icon>fas fa-arrow-right</v-icon>
      <v-icon>fab fa-fort-awesome-alt</v-icon>
      <br>
      {{ local ? $t('game.action.you-may-place-a-meeple-in-a-city-district') : $t('game.action.player-may-place-a-meeple-in-a-city-district') }}
    </div>
    <div v-if="phase === 'CocScoringPhase'" class="text-with-icons text-center">
      <v-icon>fab fa-fort-awesome-alt</v-icon>
      <v-icon>fas fa-arrow-right</v-icon>
      <br>
      {{ local ? $t('game.action.you-may-move-a-meeple-from-a-city-district') : $t('game.action.player-may-move-a-meeple-from-a-city-district') }}
    </div>
    <div v-if="phase === 'CocFinalScoringPhase' && rules['coc-final-scoring'] === 'market-only'" class="text-with-icons text-center">
      <v-icon>fab fa-fort-awesome-alt</v-icon>
      <v-icon>fas fa-arrow-right</v-icon>
      <br>
      {{ local ? $t('game.action.you-may-move-a-meeple-from-the-market-district-before-final-scoring') : $t('game.action.player-may-move-a-meeple-from-the-market-district-before-final-scoring') }}
    </div>
    <div v-if="phase === 'CocFinalScoringPhase' && rules['coc-final-scoring'] !== 'market-only'" class="text-with-icons text-center">
      <v-icon>fab fa-fort-awesome-alt</v-icon>
      <v-icon>fas fa-arrow-right</v-icon>
      <br>
      {{ local ? $t('game.action.you-may-move-a-meeple-from-a-city-district-before-final-scoring') : $t('game.action.player-may-move-a-meeple-from-a-city-district-before-final-scoring') }}
    </div>
    <div v-if="phase === 'CornCirclePhase'" class="text-with-icons text-center">
      <ExpansionSymbol :expansion="Expansion.CORN_CIRCLES" :style="{ width: 30, height: 30 }" /> {{ $t('game.feature.crop-circle') }}
      <br>
      {{ local ? $t('game.action.you-may-place-a-meeple-next-to-already-present-one') : $t('game.action.player-may-place-a-meeple-next-to-already-present-one') }}
    </div>

    <!-- key composed from phase meeples trigers properly mounted when one action follows another
         eg phantom action -->
    <div
      v-for="(item, idx) in items"
      :key="action.phase + item.type + (item.meeple || item.figureId || item.token)"
      :class="{'action-item': true, active: idx === selected }"
      @click="select(idx)"
    >
      <MeeplePlacementItem
        v-if="item.type == 'Meeple'"
        :player="action.player"
        :meeple="item.meeple"
        :options="item.options"
        :origin="item.origin"
        :phase="phase"
        :active="idx === selected"
        :coc="phase === 'CocScoringPhase' || phase === 'CocFinalScoringPhase'"
      />
      <MoveFairyNextToItem
        v-else-if="item.type == 'MoveFairyNextTo'"
        :figure-id="item.figureId"
        :options="item.options"
        :active="idx === selected"
      />
      <MoveFairyOnTileItem
        v-else-if="item.type == 'MoveFairyOnTile'"
        :figure-id="item.figureId"
        :options="item.options"
        :active="idx === selected"
      />
      <NeutralFigureItem
        v-else-if="item.type == 'NeutralFigure'"
        :figure-id="item.figureId"
        :options="item.options"
        :active="idx === selected"
      />
      <ReturnMeepleItem
        v-else-if="item.type == 'ReturnMeeple'"
        :player="action.player"
        :source="item.source"
        :options="item.options"
        :active="idx === selected"
      />
      <TowerPieceItem
        v-else-if="item.type == 'TowerPiece'"
        :options="item.options"
        :active="idx === selected"
      />
      <BridgeItem
        v-else-if="item.type == 'Bridge'"
        :options="item.options"
        :active="idx === selected"
      />
      <TunnelItem
        v-else-if="item.type == 'Tunnel'"
        :player="action.player"
        :token="item.token"
        :options="item.options"
        :active="idx === selected"
      />
      <LittleBuildingItem
        v-else-if="item.type == 'LittleBuilding'"
        :token="item.token"
        :position="item.position"
        :active="idx === selected"
      />
      <ScoreAcrobatsItem
        v-else-if="item.type == 'ScoreAcrobats'"
        :player="action.player"
        :options="item.options"
        :active="idx === selected"
      />
      <BardsLuteItem
        v-else-if="item.type == 'BardsLute'"
        :player="action.player"
        :token="item.token"
        :options="item.options"
        :active="idx === selected"
      />
      <div v-else>{{ item.type }}</div>
    </div>
    <slot />
  </section>
</template>

<script>
import { mapState } from 'vuex'

import { Expansion } from '@/models/expansions'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import BridgeItem from '@/components/game/actions/items/BridgeItem.vue'
import LittleBuildingItem from '@/components/game/actions/items/LittleBuildingItem.vue'
import MeeplePlacementItem from '@/components/game/actions/items/MeeplePlacementItem.vue'
import MoveFairyNextToItem from '@/components/game/actions/items/MoveFairyNextToItem.vue'
import MoveFairyOnTileItem from '@/components/game/actions/items/MoveFairyOnTileItem.vue'
import NeutralFigureItem from '@/components/game/actions/items/NeutralFigureItem.vue'
import ReturnMeepleItem from '@/components/game/actions/items/ReturnMeepleItem.vue'
import ScoreAcrobatsItem from '@/components/game/actions/items/ScoreAcrobatsItem.vue'
import TowerPieceItem from '@/components/game/actions/items/TowerPieceItem.vue'
import TunnelItem from '@/components/game/actions/items/TunnelItem.vue'
import BardsLuteItem from '@/components/game/actions/items/BardsLuteItem.vue'

export default {
  components: {
    BridgeItem,
    ExpansionSymbol,
    LittleBuildingItem,
    MeeplePlacementItem,
    MoveFairyNextToItem,
    MoveFairyOnTileItem,
    NeutralFigureItem,
    ReturnMeepleItem,
    ScoreAcrobatsItem,
    TowerPieceItem,
    TunnelItem,
    BardsLuteItem
  },

  props: {
    action: { type: Object, required: true },
    phase: { type: String, required: true },
    local: { type: Boolean }
  },

  data () {
    return {
      Expansion,
      selected: this.local ? 0 : null
    }
  },

  computed: {
    ...mapState({
      rules: state => state.game.setup.rules
    }),

    items () {
      const items = []
      this.action.items.forEach(item => {
        if (item.type === 'LittleBuilding') {
          // use includes three times instead of forEach over options to get items sorted by building type
          if (item.options.includes('LB_SHED')) items.push({ ...item, token: 'LB_SHED' })
          if (item.options.includes('LB_HOUSE')) items.push({ ...item, token: 'LB_HOUSE' })
          if (item.options.includes('LB_TOWER')) items.push({ ...item, token: 'LB_TOWER' })
        } else {
          items.push(item)
        }
      })
      return items
    }
  },

  watch: {
    action () {
      this.selected = 0
    }
  },

  mounted () {
    this.$root.$on('rclick', this.selectNext)
  },

  beforeDestroy () {
    this.$root.$off('rclick', this.selectNext)
  },

  methods: {
    select (idx) {
      if (this.local) {
        this.selected = idx
      }
    },

    selectNext () {
      if (this.local) {
        this.select((this.selected + 1) % this.items.length)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
section
  overflow: hidden

  .text
    font-size: 20px
    font-weight: 300
    margin-right: 20px

  .text-with-icons
    font-size: 18px
    font-weight: 300
    margin-right: 20px

    i
      font-size: 30px
      margin-bottom: 4px

  .action-item
    --action-item-scale: 1.0
    --action-item-margin: -5px
    width: calc(120px * var(--action-item-scale))
    height: calc(var(--action-bar-height) + 10px)
    transform: scale(var(--action-item-scale))
    margin: var(--action-item-margin)
    display: flex
    justify-content: center
    align-items: center

    &.active
      cursor: default

      +theme using ($theme)
        background: radial-gradient(circle, #{map-get($theme, 'action-panel-active-bg')} 72%, transparent 73%)

section.local
  .action-item
    cursor: pointer

    &:hover
      +theme using ($theme)
        background: radial-gradient(circle, #{map-get($theme, 'action-panel-hover-bg')} 72%, transparent 73%)

@media (max-height: 800px)
  section
    .action-item
      --action-item-scale: 0.6
      --action-item-margin: -12px

@media (min-height: 769px)
section.size-max
    .action-item
      --action-item-scale: 0.85
      --action-item-margin: -8px

@media (max-width: 1920px) and (min-height: 769px)
  section.size-max
    .action-item
      --action-item-scale: 0.65
      --action-item-margin: -11px
  section.size-14, section.size-13
    .action-item
      --action-item-scale: 0.75
      --action-item-margin: -10px
  section.size-12, section.size-11
    .action-item
      --action-item-scale: 0.85
      --action-item-margin: -8px

@media (max-width: 1700px) and (min-height: 769px)
  section.size-max
    .action-item
      --action-item-scale: 0.6
      --action-item-margin: -12px
  section.size-12, section.size-11
    .action-item
      --action-item-scale: 0.75
      --action-item-margin: -10px
  section.size-10, section.size-9
    .action-item
      --action-item-scale: 0.85
      --action-item-margin: -8px

@media (max-width: 1550px) and (min-height: 769px)
  section.size-max, section.size-14, section.size-13, section.size-12, section.size-11
    .action-item
      --action-item-scale: 0.65
      --action-item-margin: -11px
  section.size-10, section.size-9
    .action-item
      --action-item-scale: 0.6
      --action-item-margin: -12px

@media (max-width: 1410px)
  section.size-max, section.size-14, section.size-13, section.size-12, section.size-11
    .action-item
      --action-item-scale: 0.55
      --action-item-margin: -12px
@media (max-width: 1410px) and (min-height: 769px)
   section.size-8, section.size-7
    .action-item
      --action-item-scale: 0.85
      --action-item-margin: -8px

@media (max-width: 1280px)
  section.size-max, section.size-14, section.size-13, section.size-12, section.size-11
    .action-item
      --action-item-scale: 0.5
      --action-item-margin: -12px
@media (max-width: 1280px) and (min-height: 769px)
   section.size-8, section.size-7
    .action-item
      --action-item-scale: 0.75
      --action-item-margin: -10px

@media (max-width: 1060px)
  section.size-max, section.size-14, section.size-13, section.size-12, section.size-11
    .action-item
      --action-item-scale: 0.4
      --action-item-margin: -12px
  section.size-10, section.size-9
    .action-item
      --action-item-scale: 0.5
      --action-item-margin: -12px
@media (max-width: 1060px) and (min-height: 769px)
  section.size-8, section.size-7
    .action-item
      --action-item-scale: 0.65
      --action-item-margin: -11px
  section.size-6, section.size-5
    .action-item
      --action-item-scale: 0.85
      --action-item-margin: -8px

@media (max-width: 960px)
  section.size-max, section.size-14, section.size-13, section.size-12, section.size-11, section.size-10, section.size-9
    .action-item
      --action-item-scale: 0.4
      --action-item-margin: -12px
  section.size-8, section.size-7
    .action-item
      --action-item-scale: 0.5
      --action-item-margin: -12px
@media (max-width: 960px)  and (min-height: 769px)
  section.size-6, section.size-5
    .action-item
      --action-item-scale: 0.75
      --action-item-margin: -10px
  section.size-4, section.size-3
    .action-item
      --action-item-scale: 0.85
      --action-item-margin: -8px

@media (max-width: 800px)
  section.size-max, section.size-14, section.size-13, section.size-12, section.size-11, section.size-10, section.size-9, section.size-8, section.size-7
    .action-item
      --action-item-scale: 0.4
      --action-item-margin: -12px
  section.size-6, section.size-5
    .action-item
      --action-item-scale: 0.6
      --action-item-margin: -12px
@media (max-width: 800px)  and (min-height: 769px)
  section.size-4, section.size-3
    .action-item
      --action-item-scale: 0.75
      --action-item-margin: -10px
  section.size-2, section.size-1
    .action-item
      --action-item-scale: 0.85
      --action-item-margin: -8px
</style>
