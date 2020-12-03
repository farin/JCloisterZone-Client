<template>
  <div class="play-events" :class="{collapsed: !$store.state.showGameHistory}">
    <div
      v-for="h in reversed"
      :key="h.turn"
      class="turn"
      :style="{ display: -offset + (h.top + h.height) < BASE_Y ? 'none' : 'block' }"
      @wheel.passive="onWheel"
    >
      <div
        v-if="!h.finalScoring"
        :class="`number ${colorCssClass(h.player)} color-bg`"
        :style="{ top: `${-offset + finalHeight + h.top}px`, height: `${h.height}px`, 'clip-path': getClipPath(-offset + h.top, h.height) }"
        @click="toggleGameHistory"
      />

      <EventsRow
        v-for="(row, i) in h.rows"
        :key="i"
        :row="row"
        :player="h.player"
        :style="{ top: `${-offset + finalHeight + row.top}px`, 'clip-path': getClipPath(-offset + row.top, row.height) }"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import EventsRow from '@/components/game/play-events/EventsRow'

const BASE_Y = 94 // action panel height + gap

export default {
  components: {
    EventsRow
  },

  data () {
    return {
      finalHeight: 0,
      offset: 0,
      BASE_Y
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
      let top = BASE_Y
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
            row = { events: [], height: isScore ? 27 : 41 }
            item.rows.unshift(row)
            lastRowIsScore = isScore
          }
          row.events.push(ev)
        })
        delete item.events
        if (i === this.history.length - 1 && this.phase !== 'CommitActionPhase' && this.phase !== 'GameOverPhase') {
          if (!item.rows.length || item.rows[0].events[0].type === 'points') {
            item.rows.unshift({ events: [], height: 41 })
          }
          item.rows[0].events.push({ type: 'current-action' })
        }
        let height = 0
        item.rows.forEach(row => {
          row.top = top
          top += row.height
          height += row.height
        })
        item.top = item.rows[0].top
        item.height = height - 1 // 1px margin
        items.push(item)
      }
      this.eventsHeight = top - BASE_Y// eslint-disable-line
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
      this.finalHeight = height
    }
    this.$root.$on('final-scoring-height', this._finalScoringResized)
  },

  beforeDestroy () {
    this.$root.$off('final-scoring-height', this._finalScoringResized)
  },

  methods: {
    getClipPath (top, height) {
      if (top < BASE_Y - 9) {
        return `inset(${BASE_Y - 9 - top}px 0 0 0)`
      }
      return 'none'
    },

    toggleGameHistory () {
      this.$store.commit('toggleGameHistory')
    },

    onWheel (ev) {
      if (ev.clientX < 52) {
        const availableHeight = document.documentElement.clientHeight - BASE_Y
        const maxOffset = this.eventsHeight - availableHeight
        // handle wheel only on first item
        this.offset += ev.deltaY / 3
        if (this.offset < 0) {
          this.offset = 0
        }
        if (this.offset > maxOffset) {
          this.offset = Math.max(0, maxOffset)
        }
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.play-events
  user-select: none

.number
  position: absolute
  left: 0
  height: 40px
  align-self: stretch
  margin-right: 1px
  width: 10px
  cursor: pointer
</style>
