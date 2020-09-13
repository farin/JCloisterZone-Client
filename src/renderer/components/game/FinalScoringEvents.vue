<template>
  <div
    class="final-scoring-events"
  >
    <EventsRow
      v-for="(row, i) in nonEmptyRows"
      :key="i"
      :row="row"
    />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import EventsRow from '@/components/game/play-events/EventsRow'

export default {
  components: {
    EventsRow
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    }),

    ...mapState({
      history: state => state.game.history
    }),

    nonEmptyRows () {
      const item = this.history[this.history.length - 1]
      if (!item.finalScoring) {
        return null
      }

      const rows = {
        features: { title: 'Incomplete features', events: [] },
        farms: { title: 'Fields', events: [] },
        monasteries: { title: 'Special monasteries', events: [] },
        tradeGoods: { title: 'Trade Goods', events: [] },
        gold: { title: 'Gold ingots', events: [] },
        kingAndRobber: { title: 'King & Robber', events: [] }
      }
      item.events.forEach(ev => {
        if (!ev.points.length) {
          console.error('Received empty points event')
          return
        }
        const type = ev.points[0].name.split('.')[0]
        if (type === 'trade-goods') {
          rows.tradeGoods.events.push(ev)
        } else if (type === 'gold') {
          rows.gold.events.push(ev)
        } else if (type === 'farm') {
          rows.farms.events.push(ev)
        } else if (type === 'king' || type === 'robber') {
          rows.kingAndRobber.events.push(ev)
        } else if (type === 'monastery') {
          rows.monasteries.events.push(ev)
        } else {
          rows.features.events.push(ev)
        }
      })
      const nonEmptyRows = []
      Object.values(rows).forEach(row => {
        if (row.events.length) {
          nonEmptyRows.push(row)
        }
      })
      return nonEmptyRows
    }
  },

  mounted () {
    this._ro = new ResizeObserver(ev => {
      const { height } = ev[0].contentRect
      this.$root.$emit('final-scoring-height', height + 5) // add padding + border
    })
    this._ro.observe(this.$el)
  },

  beforeDestroy () {
    this._ro.disconnect()
  }
}
</script>

<style lang="sass" scoped>
.final-scoring-events
  position: absolute
  top: #{$action-bar-height + $panel-gap}
  left: 0
  user-select: none

  background: $bg-opaque
  min-height: 0
  padding: 0 5px 5px 11px
</style>