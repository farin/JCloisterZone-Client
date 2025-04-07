<template>
  <div
    :class="colorCssClass(player)"
  >
    <div
      class="close"
      @click="close"
    >
      <v-icon>fas fa-times</v-icon>
    </div>
    <span class="text">{{ $t('game.action.monasteries-how-do-you-want-place-follower') }}</span>
    <div>
      <v-btn
        large
        color="secondary"
        :disabled="choice === 'as-abbot-only'"
        @click="select('I')"
      >
        {{ $t('button.as-a-monk') }}
        <Meeple :type="meeple" />
      </v-btn>

      <v-btn
        large
        color="secondary"
        class="abbot-choice"
        @click="select('AS_ABBOT')"
      >
        {{ $t('button.as-a-abbot') }}
        <Meeple :type="meeple" />
      </v-btn>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Meeple from '@/components/game/Meeple'

export default {
  components: {
    Meeple
  },

  props: {
    player: { type: Number, required: true },
    choice: { type: String, required: true },
    option: { type: Object, required: true },
    meeple: { type: String, required: true }
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    })
  },

  methods: {
    close () {
      this.$store.commit('gameDialog', null)
    },

    select (location) {
      this.$root.$emit('feature.select', { ...this.option, location })
      this.close()
    }
  }
}
</script>

<style lang="sass" scoped>
.close
  position: absolute
  top: 10px
  right: 10px
  cursor: pointer

.text
  font-size: 20px
  font-weight: 300

.v-btn
  margin: 30px 20px

  svg
    margin-left: 20px
    width: 36px
    height: 36px

.abbot-choice svg
  transform: rotate(90deg)
</style>
