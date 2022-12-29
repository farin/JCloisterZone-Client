<template>
  <section>
    <div class="text">
      {{ $t('game.feature.crop-circle') }}<br>
      <template v-if="local">{{ $t('game.action.crop-circles-you-must-return-meeple') }}</template>
      <template v-else>{{ $t('game.action.crop-circles-player-must-return-meeple') }}</template>
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
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'RETURN_MEEPLE',
          payload: {
            source: 'CORN_CIRCLE',
            pointer: ptr
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
</style>
