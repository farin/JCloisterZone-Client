<template>
  <section>
    <div class="text">
      {{ local ? 'Take a prisoner' : 'Player can take a prisoner' }}
    </div>
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
