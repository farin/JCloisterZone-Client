<template>
  <section>
    <div class="text">
      <template v-if="local">
        {{ phase === 'PlaceFerryPhase' ? $t('game.action.ferries-place-a-ferry') : $t('game.action.ferries-you-can-move-ferries') }}
      </template>
      <template v-else>
        {{ phase === 'PlaceFerryPhase' ? $t('game.action.ferries-player-must-place-a-ferry') : $t('game.action.ferries-player-can-move-ferries') }}
      </template>
      <img src="~/assets/figures/ferry.png" :height="$vuetify.breakpoint.height > 768 ? 30 : 20">
    </div>
    <slot
      plain
      :label="$t('core-messages.done')"
    />
  </section>
</template>

<script>
export default {
  props: {
    action: { type: Object, required: true },
    phase: { type: String, required: true },
    local: { type: Boolean }
  },

  computed: {
    actionItem () {
      return this.action.items[0]
    }
  },

  watch: {
    actionItem (val) {
      this.showLayer()
    }
  },

  mounted () {
    this.$root.$on('ferry.select', this.onSelect)
    this.showLayer()
  },

  beforeDestroy () {
    this.$root.$off('ferry.select', this.onSelect)
    this.hideLayer()
  },

  methods: {
    showLayer () {
      if (this.local) {
        this.$store.dispatch('board/showLayer', {
          layer: 'FerryChangeLayer',
          props: {
            options: this.actionItem.options
          }
        })
      }
    },

    hideLayer () {
      this.$store.dispatch('board/hideLayer', { layer: 'FerryChangeLayer' })
    },

    async onSelect (opt) {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'PLACE_TOKEN',
          payload: {
            token: 'FERRY',
            pointer: opt
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
img
  margin-left: 30px
</style>
