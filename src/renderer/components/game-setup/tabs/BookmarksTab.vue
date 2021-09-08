<template>
  <div>
    <div class="content">
      <div>
        <ConfigSection title="My Setups">
          <div v-if="!verifiedMySetups.length" class="empty-message">
            <i>Your list is empty. To add setup here create a game first and use <span class="btn-ref"><v-icon left>far fa-heart</v-icon>Add</span> button.</i>
          </div>
          <div class="d-flex flex-wrap">
            <GameSetupBox
              v-for="({ size, setup, valid, hash }) in verifiedMySetups"
              :key="hash"
              :setup="setup"
              :size="size"
              :valid="valid"
              @tiles="showTiles(setup)"
              @load="$emit('load')"
            />
          </div>
        </ConfigSection>
      </div>
      <aside>
        <ConfigSection title="Saved To File">
          <div v-if="!recentSetupSaves.length" class="empty-message">
            <i>Nothing saved.</i>
          </div>
          <div class="d-flex flex-wrap">
            <GameSetupBox
              v-for="({ file, setup, size }) in recentSetupSaves"
              :key="file"
              :title="file"
              :setup="setup"
              :size="size"
              :valid="true"
              @tiles="showTiles(setup)"
              @load="loadSavedSetup(file)"
            />
          </div>
          <!--a v-if="!recentGameSetups.length" class="clear" href="#" @click="clearSetups"><v-icon>fas fa-times</v-icon> clear list</a-->
        </ConfigSection>
      </aside>
    </div>
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
import GameSetupBox from '@/components/game-setup/GameSetupBox'
import TileDistribution from '@/components/TileDistribution'

export default {
  components: {
    ConfigSection,
    GameSetupBox,
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
      this.verifiedMySetups = this.mySetups.map(({ size, setup }, idx) => {
        const edition = setup.elements.garden ? 2 : 1
        const valid = !this.$tiles.getExpansions(setup.sets, edition)._UNKNOWN
        // put valid to status to hash, to force render on change
        return { size, setup, valid, idx, hash: `${cyrb53(JSON.stringify(setup))}-${~~valid}` }
      })
    },

    showTiles (setup) {
      this.selectedSetup = setup
      this.detailOpen = true
    }
  }
}
</script>

<style lang="sass" scoped>
.content
  display: grid
  grid-template-columns: minmax(0, 1560px) minmax(400px, 1fr)

  aside
    +theme using ($theme)
      background: map-get($theme, 'board-bg')

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
    display: grid
    grid-template-columns: repeat(3, 1fr)
    column-gap: 10px
    padding: 4px 10px 10px

    // .v-btn
    //   min-width: 100px

</style>
