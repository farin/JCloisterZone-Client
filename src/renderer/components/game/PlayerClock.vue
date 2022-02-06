<template>
  <div class="player-clock" :class="{'out-of-time': remainingTimeSec < 0}">
    <div class="time">{{ sign }}{{ minutes }}&thinsp;:&thinsp;{{ seconds }}</div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    player: { type: Number, required: true }
  },

  data () {
    return {
      milis: this.$store.state.game.clock[this.player]
    }
  },

  computed: {
    ...mapState({
      clock: state => state.game.clock,
      timer: state => state.game.setup.timer,
      lastMessageClockLocal: state => state.game.lastMessageClockLocal
    }),

    playerTurns () {
      return this.$store.state.game.history.reduce((acc, h) => acc + (h.player === this.player ? 1 : 0), 0)
    },

    running () {
      return this.$store.state.game.action?.player === this.player
    },

    clockMilis () {
      return this.clock[this.player]
    },

    remainingTimeSec () {
      return this.timer.initial + this.timer.turn * this.playerTurns - Math.round(this.milis / 1000)
    },

    minutes () {
      const m = parseInt(Math.abs(this.remainingTimeSec) / 60)
      return m
    },

    seconds () {
      const s = parseInt(Math.abs(this.remainingTimeSec)) % 60
      return `${s < 10 ? '0' : ''}${s}`
    },

    sign () {
      return this.remainingTimeSec < 0 ? '- ' : ''
    }
  },

  watch: {
    clockMilis (val) {
      this.milis = val
    },

    running (val, old) {
      if (val) {
        this.start()
      } else {
        this.stop()
      }
    }
  },

  mounted () {
    if (this.running) {
      this.start()
    }
  },

  beforeDestroy () {
    this.stop()
  },

  methods: {
    start () {
      this.stop()
      this.milis = this.clockMilis + Date.now() - this.lastMessageClockLocal
      this.updateSecTimeout = setTimeout(this.updateSec, 1000 - (this.milis % 1000))
    },

    stop () {
      clearTimeout(this.updateSecTimeout)
    },

    updateSec () {
      this.milis = this.clockMilis + Date.now() - this.lastMessageClockLocal
      this.updateSecTimeout = setTimeout(this.updateSec, 1000 - (this.milis % 1000))
    }
  }
}
</script>

<style lang="sass" scoped>
.player-clock
  display: flex
  justify-content: center
  margin-top: 2px
  margin-bottom: -10px

.time
  font-size: 20px
  font-weight: 500

.out-of-time
  color: #D32F2F
</style>
