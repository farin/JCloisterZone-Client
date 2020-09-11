<template>
  <section>
    <div class="text">
      Take a prisoner
    </div>
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
