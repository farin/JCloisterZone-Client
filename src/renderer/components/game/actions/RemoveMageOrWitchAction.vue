<template>
  <section>
    <template v-if="local">
      <span class="text">{{ $t('game.action.mage-and-witch-remove-mage-or-witch') }}</span>
      <v-btn large @click="select('mage.1')">
        <NeutralFigure figure="mage" />
      </v-btn>
      <v-btn large @click="select('witch.1')">
        <NeutralFigure figure="witch" />
      </v-btn>
    </template>
    <span v-else class="text">{{ $t('game.action.mage-and-witch-player-must-remove-mage-or-witch') }}</span>
  </section>
</template>

<script>
import NeutralFigure from '@/components/game/NeutralFigure'

export default {
  components: {
    NeutralFigure
  },

  props: {
    action: { type: Object, required: true },
    local: { type: Boolean }
  },

  methods: {
    async select (figureId) {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'MOVE_NEUTRAL_FIGURE',
          payload: {
            figureId,
            to: null
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.text
  font-size: 20px
  font-weight: 300
  margin-right: 20px

.v-btn
  margin: 0 10px
  height: 60px !important

  svg
    width: 50px
    height: 50px
</style>
