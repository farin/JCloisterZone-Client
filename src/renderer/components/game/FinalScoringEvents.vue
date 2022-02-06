<template>
  <div
    class="final-scoring-events"
  >
    <EventsRow
      v-for="(row, i) in nonEmptyRows"
      :key="i"
      :row="row"
      final
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
        kingAndRobber: { title: 'King & Robber', events: [] },
        penalties: { title: 'Penalties', events: [] }
      }
      item.events.forEach(ev => {
        if (!ev.points?.length) {
          console.log(ev)
          if (ev.type !== 'token-placed' || !ev.token.startsWith('BIGTOP_')) {
            // ignore big top token
            console.error('Received empty points event', ev)
          }
          return
        }
        const type = ev.points[0].name.split('+')[0].split('.')[0]
        if (type === 'trade-goods') {
          rows.tradeGoods.events.push(ev)
        } else if (type === 'gold') {
          rows.gold.events.push(ev)
        } else if (type === 'field') {
          rows.farms.events.push(ev)
        } else if (type === 'king' || type === 'robber') {
          rows.kingAndRobber.events.push(ev)
        } else if (type === 'special-monastery') {
          rows.monasteries.events.push(ev)
        } else if (type === 'vodyanoy') {
          rows.penalties.events.push(ev)
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
      this.$root.$emit('final-scoring-height', height + 10) // add padding + border + 5px margin
    })
    this._ro.observe(this.$el)
    this.$root.$emit('final-scoring-height', this.$el.clientHeight + 10)
  },

  beforeDestroy () {
    this._ro.disconnect()
  }
}
</script>

<style lang="sass" scoped>
.final-scoring-events
  position: absolute
  top: calc(var(--action-bar-height) + #{$panel-gap})
  left: 0
  user-select: none
  min-height: 0
  padding: 0 5px 5px 11px

  +theme using ($theme)
    background: map-get($theme, 'opaque-bg')
</style>
