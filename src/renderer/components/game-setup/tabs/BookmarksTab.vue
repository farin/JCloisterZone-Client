<template>
  <div>
    <ConfigSection title="My Setups">
      <div v-if="!verifiedMySetups.length" class="empty-message">
        <i>Your list is empty. To add setup here create a game first and use <span class="btn-ref"><v-icon left>far fa-heart</v-icon>Add</span> button.</i>
      </div>
      <div class="d-flex flex-wrap">
        <div
          v-for="({ setup, valid, idx, hash }) in verifiedMySetups"
          :key="hash"
          class="game-setup-item"
          :class="{ invalid: !valid }"
          @contextmenu="showRecentSetup($event, idx)"
        >
          <GameSetupOverviewInline :sets="setup.sets" :elements="setup.elements" />
          <div class="buttons">
            <div class="tiles-link">
              <a href="#" @click.prevent="showTiles(idx)">
                <span>11</span> <v-icon>fas fa-layer-group</v-icon>
              </a>
            </div>

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
          </div>
        </div>
      </div>
    </ConfigSection>

    <ConfigSection title="Recently Saved To File">
      <div v-if="!recentSetupSaves.length" class="empty-message">
        <i>No setup was recently saved.</i>
      </div>
      <a v-for="file in recentSetupSaves" :key="file" href="#" @click.prevent="loadSavedSetup(file)">{{ file }}</a>
      <!--a v-if="!recentGameSetups.length" class="clear" href="#" @click="clearSetups"><v-icon>fas fa-times</v-icon> clear list</a-->
    </ConfigSection>

    <v-dialog
      v-model="detailOpen"
      max-width="800"
    >
      <v-card v-if="selectedSetup">
        <v-card-title class="headline">Tiles</v-card-title>
        <v-card-text>
          <TileDistribution
            :tile-size="$vuetify.breakpoint.height > 768 ? 60 : 48"
            :sets="selectedSetup.sets"
            :rules="selectedSetup.rules"
            small
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="detailOpen = false"
          >Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import { cyrb53 } from '@/utils/hash'
import ConfigSection from '@/components/game-setup/ConfigSection'
import GameSetupOverviewInline from '@/components/game-setup/overview/GameSetupOverviewInline'
import TileDistribution from '@/components/TileDistribution'

export default {
  components: {
    ConfigSection,
    GameSetupOverviewInline,
    TileDistribution
  },

  data () {
    return {
      verifiedMySetups: [],
      selectedSetup: null,
      detailOpen: false
    }
  },

  computed: {
    ...mapState({
      mySetups: state => state.settings.mySetups,
      recentSetupSaves: state => state.settings.recentSetupSaves
    })
  },

  mounted () {
    this.verifyMySetups()
  },

  methods: {
    async loadSavedSetup (file) {
      try {
        await this.$store.dispatch('game/load', file)
        this.$emit('load')
      } catch {
        await this.$store.dispatch('settings/validateRecentSetupSaves')
      }
    },

    verifyMySetups () {
      this.verifiedMySetups = this.mySetups.map((setup, idx) => {
        const edition = setup.elements.garden ? 2 : 1
        const valid = !this.$tiles.getExpansions(setup.sets, edition)._UNKNOWN
        // put valid to status to hash, to force render on change
        return { setup, valid, idx, hash: `${cyrb53(JSON.stringify(setup))}-${~~valid}` }
      })
    },

    showTiles (idx) {
      this.selectedSetup = this.verifiedMySetups[idx].setup
      this.detailOpen = true
    },

    loadSetup (setup) {
      this.$store.dispatch('gameSetup/load', setup)
      this.$emit('load', setup)
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
.empty-message
  margin: 30px 0
  text-align: center

  .btn-ref
    border: 1px solid
    border-radius: 2px
    padding: 0 4px

  .v-icon
    font-size: 16px
    position: relative
    top: -2px

.game-setup-item
  display: flex
  flex-direction: column
  padding-top: 15px
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

  .buttons
    display: flex
    padding: 4px 10px 10px

    .tiles-link
      flex-grow: 1

      a
        text-decoration: none

        +theme using ($theme)
          color: map-get($theme, 'gray-text-color')

        span
          font-size: 22px
          font-weight: bold
          line-height: 1
          position: relative
          top: 4px

      a:hover
        &, .v-icon
          +theme using ($theme)
            color: map-get($theme, 'text-color')

    .v-btn
      min-width: 100px
      margin-left: 8px

</style>
