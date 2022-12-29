<template>
  <section>
    <div class="text">
      {{ local ? $t('game.action.tower-you-can-take-a-prisoner') : $t('game.action.tower-player-can-take-a-prisoner') }}
    </div>
    <slot />
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
        type: 'CAPTURE_FOLLOWER',
        payload: {
          pointer: ptr
        }
      })
    }
  }
}
</script>

<style lang="sass" scoped>
section
  overflow: hidden
</style>
