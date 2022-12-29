<template>
  <div :class="`player-slot color-${number} ${slotState} ${readOnly ? '' : 'editable'}`" @click="toggle">
    <div
      v-if="order !== null && (readOnly || !randomized)"
      :class="`order order-${order}`"
    >
      {{ order }}
    </div>
    <svg class="meeple" :width="$vuetify.breakpoint.height > 768 ? 105 : 80" :height="$vuetify.breakpoint.height > 768 ? 105 : 80">
      <use :href="`${MEEPLES_SVG}#small-follower`" />
    </svg>
    <div class="state">
      <template v-if="slotState === 'open'">{{ $t('game-setup.create.open-slot') }}</template>
      <template v-if="slotState === 'local'">{{ $t('game-setup.create.local-player') }}</template>
      <template v-if="slotState === 'remote'">{{ $t('game-setup.create.remote-player') }}</template>
    </div>
    <div
      v-if="slotState === 'local'"
      class="name"
      @click.stop="openEdit"
    >
      {{ name }}
      <v-icon v-if="slotState === 'local' && !readOnly">fas fa-pencil-alt</v-icon>
    </div>
    <div v-else class="name">
      <template v-if="slotState === 'open' && !readOnly">{{ $t('game-setup.create.click-to-assign') }}</template>
      <template v-else>{{ name }}</template>
    </div>

    <v-dialog v-model="edit" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ $t('game-setup.create.rename-player') }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-text-field ref="nameInput" v-model="editName" :label="$t('game-setup.create.name')" @keydown.enter="rename" />
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="edit = false">{{ $t('buttons.cancel') }}</v-btn>
          <v-btn text @click="rename">{{ $t('buttons.confirm') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  props: {
    number: { type: Number, required: true },
    owner: { type: String, default: null },
    name: { type: String, default: null },
    order: { type: Number, default: null },
    readOnly: { type: Boolean }
  },

  data () {
    return {
      MEEPLES_SVG,
      edit: false,
      editName: null
    }
  },

  computed: {
    ...mapState({
      sessionId: state => state.networking.sessionId,
      randomized: state => state.game.setup.options.randomizeSeating
    }),

    slotState () {
      if (this.owner === this.sessionId) {
        return 'local'
      }
      return this.owner ? 'remote' : 'open'
    }
  },

  methods: {
    toggle () {
      const { number } = this
      if (this.slotState === 'local') {
        this.$store.dispatch('gameSetup/releaseSlot', { number })
      } else if (this.slotState === 'open') {
        this.$store.dispatch('gameSetup/takeSlot', { number })
      }
    },

    openEdit () {
      if (!this.readOnly) {
        this.editName = this.name
        this.edit = true
        setTimeout(() => {
          this.$refs.nameInput.focus()
        }, 1)
      }
    },

    rename () {
      if (this.editName !== this.name) {
        this.$store.dispatch('gameSetup/renameSlot', { number: this.number, name: this.editName })
      }
      this.edit = false
    }
  }
}
</script>

<style lang="sass" scoped>
.player-slot
  position: relative
  padding: 40px 0 30px 0

  display: flex
  flex-direction: column
  align-items: center
  overflow: hidden

  +theme using ($theme)
    background: map-get($theme, 'slot-open-bg')
    color: map-get($theme, 'slot-open-text')

  .order
    position: absolute
    top: -70px
    right: -37px
    color: white
    font-size: 224px
    font-weight: 900
    opacity: 0.4
    z-index: 1

  .order-1
    right: -48px

  .order-4
    right: -34px

  svg
    margin-bottom: 30px

  .state
    font-size: 24px
    text-transform: uppercase
    font-weight: 300
    margin-bottom: 15px

  .name
    font-size: 24px
    height: 36px
    width: 100%
    text-align: center
    z-index: 2

    +theme using ($theme)
      color: map-get($theme, 'text-color')

    i
      visibility: hidden

    &:hover i
      visibility: visible

  &.open.editable
    .name
      font-size: 16px
      font-style: italic
      padding-top: 8px

      +theme using ($theme)
        color: map-get($theme, 'slot-assign-text')

  &.open, &.local
    cursor: pointer

  &.local, &.remote
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15), 0 3px 10px 0 rgba(0, 0, 0, 0.10)

  &.local
    +theme using ($theme)
      background: map-get($theme, 'slot-local-bg')
      color: map-get($theme, 'slot-local-text')

  &.remote
    +theme using ($theme)
      background: map-get($theme, 'slot-remote-bg')
      color: map-get($theme, 'slot-remote-text')

  &.open
    .order
      color: #ccc

@media (max-height: 768px)
  .player-slot
    padding: 20px 0 10px 0

    svg
      margin-bottom: 20px

    .state, .name
      font-size: 20px

    .order
      font-size: 136px
      top: -30px
      right: -22px

    .order-1
      right: -29px

    .order-4
      right: -21px
</style>
