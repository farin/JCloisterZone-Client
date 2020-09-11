<template>
  <section>
    <div class="text">
      Crop Circle<br>
      You must return one of your meeples
    </div>
    <slot plain />
  </section>
</template>

<script>
import SingleMeepleSelectMixin from '@/components/game/actions/SingleMeepleSelectMixin.js'

export default {
  mixins: [SingleMeepleSelectMixin],

  props: {
    action: { type: Object, required: true }
  },

  methods: {
    async onSelect (ptr) {
      console.log(ptr)
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
</script>

<style lang="sass" scoped>
</style>
