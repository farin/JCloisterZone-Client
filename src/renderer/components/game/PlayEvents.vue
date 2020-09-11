<template>
  <div
    class="play-events"
  >
    <div
      class="play-events-content"
      :style="{top: -offset + 'px'}"
    >
      <div ref="wrapper">
        <div
          v-for="h in reversed"
          :key="h.turn"
          class="turn"
          @wheel.passive="onWheel"
        >
          <div
            v-if="!h.finalScoring"
            :class="`number ${colorCssClass(h.player)} color-bg`"
          />
          <div class="events">
            <EventsRow
              v-for="(row, i) in h.rows"
              :key="i"
              :row="row"
              :player="h.player"
            />
          </div>
        </div>
      </div>
      <div
        class="additional-wheel-tracking-area"
        @wheel.passive="onWheel"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import EventsRow from '@/components/game/play-events/EventsRow'

export default {
  components: {
    EventsRow
  },

  data () {
    return {
      offset: 0
    }
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    }),

    ...mapState({
      history: state => state.game.history,
      phase: state => state.game.phase
    }),

    reversed () {
      const items = []
      for (let i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i].finalScoring) {
          continue
        }
        const item = { ...this.history[i] }
        let lastRowIsScore = null
        let row = null
        item.rows = []
        item.events.forEach(ev => {
          const isScore = ev.type === 'points' || ev.type === 'token-received'
          if (isScore !== lastRowIsScore) {
            row = { events: [] }
            item.rows.unshift(row)
            lastRowIsScore = isScore
          }
          row.events.push(ev)
        })
        delete item.events
        if (i === this.history.length - 1 && this.phase !== 'CommitActionPhase' && this.phase !== 'GameOverPhase') {
          if (!item.rows.length || item.rows[0].events[0].type === 'points') {
            item.rows.unshift({ events: [] })
          }
          item.rows[0].events.push({ type: 'current-action' })
        }
        items.push(item)
      }
      return items
    }
  },

  watch: {
    history () {
      this.offset = 0
    }
  },

  created () {
    this._finalScoringResized = height => {
      this._finalHeight = height
      this.updateAbsolutePosition()
    }
    this.$root.$on('final-scoring-height', this._finalScoringResized)
  },

  mounted () {
    this.updateAbsolutePosition()
  },

  beforeDestroy () {
    this.$root.$off('final-scoring-height', this._finalScoringResized)
  },

  methods: {
    onWheel (ev) {
      this.offset += ev.deltaY / 3
      if (this.offset < 0) {
        this.offset = 0
      }
      if (this.offset > this.$refs.wrapper.clientHeight - 20) {
        this.offset = this.$refs.wrapper.clientHeight - 20
      }
    },

    updateAbsolutePosition () {
      if (!this._finalHeight) {
        return
      }
      if (!this._boundingRect) {
        this._boundingRect = this.$el.getBoundingClientRect()
      }
      // add 8px gap
      this.$el.style.top = (this._boundingRect.top + this._finalHeight + 8) + 'px'
      this.$el.style.height = (this._boundingRect.height - this._finalHeight + 8) + 'px'
    }
  }
}
</script>

<style lang="sass" scoped>
.play-events
  height: calc(100vh - #{$action-bar-height + $panel-gap})
  position: absolute
  top: #{$action-bar-height + $panel-gap}
  left: 0
  user-select: none
  overflow-y: hidden

.play-events-content
  position: relative

.turn
  display: flex
  min-height: 40px
  margin-bottom: 1px

  .number
    align-self: stretch
    margin-right: 1px
    width: 10px

.additional-wheel-tracking-area
  width: 51px
  height: 100vh
</style>
