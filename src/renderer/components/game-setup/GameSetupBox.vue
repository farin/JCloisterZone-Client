<template>
  <div
    class="game-setup-box"
    :class="{ invalid: !valid }"
    @contextmenu="showRecentSetup($event, idx)"
  >
    <header>
      <span>{{ title }}</span>
      <a class="tiles-link" href="#" @click.prevent="$emit('tiles')">
        <span>{{ size }}</span> <v-icon>fas fa-layer-group</v-icon>
      </a>
    </header>
    <v-divider />
    <GameSetupOverviewInline :sets="setup.sets" :elements="setup.elements" />
    <div class="buttons">
      <v-btn v-if="$store.getters['settings/isMySetup'](setup)" small color="secondary" @click.stop="removeSetup(setup)">
        <v-icon left>fa-heart</v-icon>
        Remove
      </v-btn>
      <v-btn v-else small color="secondary" @click.stop="addSetup(setup)">
        <v-icon left>far fa-heart</v-icon>
        Add
      </v-btn>
      <v-btn small color="secondary" :disabled="!valid" @click.stop="valid && loadSetup(setup)">
        <v-icon left>fa-share</v-icon>
        Load
      </v-btn>
      <v-btn small color="primary" :disabled="!valid" @click.stop="valid && createGame(setup)">
        <v-icon left>fa-play</v-icon>
        Create
      </v-btn>
    </div>
  </div>
</template>

<script>
import GameSetupOverviewInline from '@/components/game-setup/overview/GameSetupOverviewInline'

export default {
  components: {
    GameSetupOverviewInline
  },

  props: {
    title: { type: String, default: '' },
    setup: { type: Object, required: true },
    size: { type: Number, required: true },
    valid: { type: Boolean, default: true }
  },

  methods: {
    async loadSetup (setup) {
      await this.$store.dispatch('gameSetup/load', setup)
      this.$emit('load', setup)
    },

    async createGame (setup) {
      await this.$store.dispatch('gameSetup/load', setup)
      await this.$store.dispatch('gameSetup/createGame')
    },

    removeSetup (setup) {
      this.$store.dispatch('settings/removeMySetup', setup)
    },

    addSetup (setup) {
      this.$store.dispatch('settings/addMySetup', setup)
    }
  }
}
</script>

<style lang="sass" scoped>
.game-setup-box
  display: flex
  flex-direction: column
  margin: 10px
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.10), 0 3px 10px 0 rgba(0, 0, 0, 0.03)

  +theme using ($theme)
    color: map-get($theme, 'cards-text')
    background-color: map-get($theme, 'cards-bg')
    border: 1px solid #{map-get($theme, 'line-color')}

  .game-setup-overview-inline
    flex-grow: 1

  &.invalid
    cursor: default
    opacity: 0.4

  header
    display: flex
    justify-content: flex-end
    padding: 5px

    > span
      flex-grow: 1

    a.tiles-link
      text-decoration: none

      +theme using ($theme)
        color: map-get($theme, 'gray-text-color')

      span
        font-size: 22px
        font-weight: bold
        line-height: 1
        position: relative
        top: 4px

      &:hover
        &, .v-icon
          +theme using ($theme)
            color: map-get($theme, 'text-color')

  .v-divider
    width: calc(100% - 20px)
    margin: 0 auto 10px

  .buttons
    display: flex
    justify-content: flex-end
    padding: 14px 10px 10px

    .v-btn
      margin-left: 10px
</style>
