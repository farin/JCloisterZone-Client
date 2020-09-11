<template>
  <section>
    <v-btn color="secondary" @click="confirm">
      Confirm
    </v-btn>
  </section>
</template>

<script>
export default {
  props: {
    action: { type: Object, required: true }
  },

  mounted () {
    window.addEventListener('keydown', this.onKeyDown)
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  methods: {
    async confirm () {
      await this.$store.dispatch('game/apply', {
        type: 'COMMIT',
        payload: {}
      })
    },

    onKeyDown (ev) {
      if (ev.key === ' ') {
        this.confirm()
      }
    }
  }
}
</script>
