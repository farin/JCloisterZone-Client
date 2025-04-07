<template>
  <div>
    <ConfigSection :title="$t('game-setup.timer.player-time-limit')">
      <template v-if="timer !== null">
        <!-- TODO use display grid -->
        <div class="limits-row">
          <span class="label">{{ $t('game-setup.timer.at-game-start-set-timer-to') }}</span>
          <div class="clock">
            <TimeInput v-model="initial" />
          </div>
        </div>
        <div class="limits-row">
          <span class="label">{{ $t('game-setup.timer.each-turn-increase-timer-by') }}</span>
          <div class="clock">
            <TimeInput v-model="turn" />
          </div>
        </div>
        <!-- <div class="limits-row">
          <span class="label">{{ $t('game-setup.timer.when-time-is-over') }}</span>
          <span>{{ $t('game-setup.timer.do-nothing') }}</span>
        </div> -->
        <div class="buttons">
          <v-btn color="secondary" @click="disableLimits">{{ $t('game-setup.timer.disable-limits') }}</v-btn>
        </div>
      </template>
      <template v-else>
        <div class="unlimited">
          {{ $t('game-setup.timer.unlimited-time') }}
        </div>
        <div class="buttons">
          <v-btn color="secondary" @click="enableLimits">{{ $t('game-setup.timer.enable-limits') }}</v-btn>
        </div>
      </template>
    </ConfigSection>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ConfigSection from '@/components/game-setup/ConfigSection'
import TimeInput from '@/components/game-setup/TimeInput'

export default {
  components: {
    ConfigSection,
    TimeInput
  },

  data () {
    return {
      storedValue: {
        initial: 3 * 60,
        turn: 20
      }
    }
  },

  computed: {
    ...mapState({
      timer: state => state.gameSetup.timer
    }),

    initial: {
      get () {
        return this.timer ? this.timer.initial : null
      },

      set (val) {
        this.$store.commit('gameSetup/timer', {
          ...this.timer,
          initial: val
        })
      }
    },

    turn: {
      get () {
        return this.timer ? this.timer.turn : null
      },

      set (val) {
        this.$store.commit('gameSetup/timer', {
          ...this.timer,
          turn: val
        })
      }
    }
  },

  methods: {
    enableLimits () {
      this.$store.commit('gameSetup/timer', { ...this.storedValue })
    },

    disableLimits () {
      this.storedValue = { ...this.timer }
      this.$store.commit('gameSetup/timer', null)
    }
  }
}
</script>

<style lang="sass" scoped>
.unlimited
  margin-top: 40px
  text-align: center
  font-size: 36px
  font-weight: 300

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')

.buttons
  margin-top: 40px
  text-align: center

.limits-row
  margin-top: 40px
  display: flex
  justify-content: center
  align-items: center

  .label
    width: 220px
    text-align: right

.clock
  margin: 0 40px
</style>
