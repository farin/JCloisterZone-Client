<template>
  <div
    :class="`${ev.type === 'points' || ev.type === 'token-received' ? 'score-event' : 'play-event'} ev-${ev.type}`"
  >
    <component
      :is="component"
      v-if="component"
      :ev="ev"
      :player="player"
    />
    <div v-else-if="ev.type === 'current-action'" class="current-action" />
    <div v-else class="unknown-event">{{ ev.type }}</div>
  </div>
</template>

<script>
import CastleCreatedEvent from '@/components/game/play-events/CastleCreatedEvent'
import DragonMovedEvent from '@/components/game/play-events/DragonMovedEvent'
import FlierRollEvent from '@/components/game/play-events/FlierRollEvent'
import MeepleDeployedEvent from '@/components/game/play-events/MeepleDeployedEvent'
import MeepleReturnedEvent from '@/components/game/play-events/MeepleReturnedEvent'
import NeutralMovedEvent from '@/components/game/play-events/NeutralMovedEvent'
import PointsEvent from '@/components/game/play-events/PointsEvent'
import PrisonersExchangeEvent from '@/components/game/play-events/PrisonersExchangeEvent'
import RansomPaidEvent from '@/components/game/play-events/RansomPaidEvent'
import TileAuctionedEvent from '@/components/game/play-events/TileAuctionedEvent'
import TilePlacedEvent from '@/components/game/play-events/TilePlacedEvent'
import TileDiscardedEvent from '@/components/game/play-events/TileDiscardedEvent'
import TokenPlacedEvent from '@/components/game/play-events/TokenPlacedEvent'
import TokenReceivedEvent from '@/components/game/play-events/TokenReceivedEvent'

const MAPPING = {
  'castle-created': CastleCreatedEvent,
  'dragon-moved': DragonMovedEvent,
  'flier-roll': FlierRollEvent,
  'meeple-captured': MeepleReturnedEvent, // reuse returned component
  'meeple-deployed': MeepleDeployedEvent,
  'meeple-returned': MeepleReturnedEvent,
  'neutral-moved': NeutralMovedEvent,
  'points': PointsEvent,
  'prisoners-exchange': PrisonersExchangeEvent,
  'ransom-paid': RansomPaidEvent,
  'tile-auctioned': TileAuctionedEvent,
  'tile-placed': TilePlacedEvent,
  'tile-discarded': TileDiscardedEvent,
  'token-placed': TokenPlacedEvent,
  'token-received': TokenReceivedEvent
}

export default {
  components: {
    CastleCreatedEvent,
    DragonMovedEvent,
    FlierRollEvent,
    MeepleDeployedEvent,
    MeepleReturnedEvent,
    NeutralMovedEvent,
    PointsEvent,
    PrisonersExchangeEvent,
    RansomPaidEvent,
    TileAuctionedEvent,
    TilePlacedEvent,
    TileDiscardedEvent,
    TokenPlacedEvent,
    TokenReceivedEvent
  },

  props: {
    ev: { type: Object, required: true },
    player: { type: Number, default: null }
  },

  computed: {
    component () {
      return MAPPING[this.ev.type] || null
    }
  }
}
</script>

<style lang="sass" scoped>
.play-event
  display: flex
  justify-content: center
  align-items: center
  margin-right: 1px
  min-width: 40px
  height: 40px

.play-event.ev-current-action
  background: transparent
  border: 4px solid #ccc
  width: 38px
  height: 38px
  margin: 1px

.unknown-event
  font-size: 12px

.play-event, .score-event
  +theme using ($theme)
    background: map-get($theme, 'opaque-bg')
</style>

<style lang="sass">
.play-event
  .one-square
    display: flex
    justify-content: center
    align-items: center
    width: 40px
    height: 40px

  svg.tile-img
    width: 40px
    height: 40px

  svg.meeple
    width: 34px
    height: 34px
</style>
