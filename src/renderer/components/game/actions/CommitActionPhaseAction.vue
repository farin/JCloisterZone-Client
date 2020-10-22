<template>
  <section>
    <template v-if="local">
      <v-btn color="secondary" @click="confirm">
        Confirm
      </v-btn>
      <span class="text">
        your action
      </span>
    </template>
    <span v-else class="text">
      Waiting for player confirmation.
    </span>
  </section>
</template>

<script>
export default {
  props: {
    action: { type: Object, required: true },
    local: { type: Boolean }
  },

  mounted () {
    window.addEventListener('keydown', this.onKeyDown)
  },

  beforeDestroy () {
    window.removeEventListener('keydown', this.onKeyDown)
  },

  methods: {
    async confirm () {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'COMMIT',
          payload: {}
        })
      }
    },

    onKeyDown (ev) {
      if (ev.key === ' ') {
        this.confirm()
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.v-btn
  margin-right: 20px
</style>
