<template>
  <section>
    <template v-if="local">
      <v-btn color="secondary" @click="confirm">
        Confirm
      </v-btn>
      <template v-if="undoAllowed">
        or
        <v-btn @click="undo">Undo</v-btn>
      </template>
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
import { mapGetters } from 'vuex'

export default {
  props: {
    action: { type: Object, required: true },
    local: { type: Boolean }
  },

  computed: mapGetters({
    undoAllowed: 'game/isUndoAllowed'
  }),

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

    async undo () {
      if (this.local) {
        await this.$store.dispatch('game/undo')
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
  margin: 0 20px
</style>
