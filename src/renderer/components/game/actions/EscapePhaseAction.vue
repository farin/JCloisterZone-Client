<template>
  <section>
    <img src="~/assets/features/C1/escape.png" :height="$vuetify.breakpoint.height > 768 ? 54 : 37">
    <div class="text">
      {{ local ? $t('game.action.siege-you-can-escape-a-besieged-city') : $t('game.action.siege-player-can-escape-a-besieged-city') }}
    </div>
    <slot plain />
  </section>
</template>

<script>
import SingleMeepleSelectMixin from '@/components/game/actions/SingleMeepleSelectMixin.js'

export default {
  mixins: [SingleMeepleSelectMixin],

  props: {
    action: { type: Object, required: true },
    local: { type: Boolean }
  },

  methods: {
    async onSelect (ptr) {
      await this.$store.dispatch('game/apply', {
        type: 'RETURN_MEEPLE',
        payload: {
          source: 'SIEGE_ESCAPE',
          pointer: ptr
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
img
  margin-right: 20px
</style>
