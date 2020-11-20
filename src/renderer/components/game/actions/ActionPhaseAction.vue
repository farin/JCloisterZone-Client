<template>
  <section :class="{ local }">
    <div v-if="phase === 'CocFollowerPhase'" class="text">{{ local ? 'You' : 'Player' }} may place a meeple in a city district.</div>
    <div v-if="phase === 'CocScoringPhase'" class="text">{{ local ? 'You' : 'Player' }} may move a meeple from a city district.</div>
    <div v-if="phase === 'CocFinalScoringPhase' && rules['coc-final-scoring'] === 'market-only'" class="text">{{ local ? 'You' : 'Player' }} may move a meeple from the market district before final scoring.</div>
    <div v-if="phase === 'CocFinalScoringPhase' && rules['coc-final-scoring'] !== 'market-only'" class="text">{{ local ? 'You' : 'Player' }} may move a meeple from a city district before final scoring.</div>
    <div v-if="phase === 'CornCirclePhase'" class="text">Crop Circle:<br>{{ local ? 'You' : 'Player' }} may place a meeple next to already present one.</div>

    <!-- key composed from phase meepls trigers properly mounted when one action follows another
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
      <div v-else>{{ item.type }}</div>
    </div>
    <slot />
  </section>
</template>

<script>
import { mapState } from 'vuex'
import BridgeItem from '@/components/game/actions/items/BridgeItem.vue'
import LittleBuildingItem from '@/components/game/actions/items/LittleBuildingItem.vue'
import MeeplePlacementItem from '@/components/game/actions/items/MeeplePlacementItem.vue'
import MoveFairyNextToItem from '@/components/game/actions/items/MoveFairyNextToItem.vue'
import MoveFairyOnTileItem from '@/components/game/actions/items/MoveFairyOnTileItem.vue'
import NeutralFigureItem from '@/components/game/actions/items/NeutralFigureItem.vue'
import ReturnMeepleItem from '@/components/game/actions/items/ReturnMeepleItem.vue'
import TowerPieceItem from '@/components/game/actions/items/TowerPieceItem.vue'
import TunnelItem from '@/components/game/actions/items/TunnelItem.vue'

export default {
  components: {
    BridgeItem,
    LittleBuildingItem,
    MeeplePlacementItem,
    MoveFairyNextToItem,
    MoveFairyOnTileItem,
    NeutralFigureItem,
    ReturnMeepleItem,
    TowerPieceItem,
    TunnelItem
  },

  props: {
    action: { type: Object, required: true },
    phase: { type: String, required: true },
    local: { type: Boolean }
  },

  data () {
    return {
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
    window.addEventListener('keydown', this.onKeyDown)
  },

  beforeDestroy () {
    this.$root.$off('rclick', this.selectNext)
    window.removeEventListener('keydown', this.onKeyDown)
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
    },

    onKeyDown (ev) {
      if (this.local && ev.key === 'Tab' && !this.$store.state.gameDialog) {
        this.selectNext()
        ev.preventDefault()
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

  .action-item
    width: 120px
    height: $action-bar-height + 10px
    margin: -5px
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
</style>
