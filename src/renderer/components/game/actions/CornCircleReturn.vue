<template>
  <section>
    <div class="text">
      Crop Circle<br>
      <template v-if="local">You must return one of your meeples</template>
      <template v-else>Player must return a meeple</template>
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
