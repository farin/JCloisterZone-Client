<template>
  <section>
    <img src="~/assets/features/C1/escape.png" height="54">
    <div class="text">
      You can escape a besieged city.
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
