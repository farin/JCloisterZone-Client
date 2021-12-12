<template>
  <div>
    <div class="content">
      <div>
        <ConfigSection title="My Favorites">
          <div v-if="!verifiedMySetups.length" class="empty-message">
            <i>You have not game setup in favorites list. To add setup here create a game first and then use <span class="btn-ref"><v-icon left>far fa-heart</v-icon>Add To Favorites</span> button in overview sidebar.</i>
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
        <div class="load-button">
          <v-btn small color="secondary" @click="loadFromFile">
            <v-icon left>fa-file</v-icon>
            Load Setup From File
          </v-btn>
        </div>

        <ConfigSection title="Setups Saved To File">
          <div v-if="!recentSetupSaves.length" class="empty-message">
            <i>Nothing saved.</i>
          </div>
          <div class="file-list">
            <div
              v-for="file in recentSetupSaves"
              :key="file"
              class="file-item"
            >
              <div class="file-name">
                <span class="dirname">{{ dirname(file) }}</span>
                <span class="basename">{{ basename(file) }}</span>
              </div>
              <div class="buttons">
                <v-btn x-small color="secondary" @click.stop="loadSavedSetup(file)">
                  <v-icon>fa-share</v-icon>
                </v-btn>
                <v-btn x-small color="primary" @click.stop="loadSavedSetup(file, true)">
                  <v-icon>fa-play</v-icon>
                </v-btn>
              </div>
            </div>

            <div v-if="recentSetupSaves.length" class="clear">
              <a href="#" @click="clearRecentSaves"><v-icon>fas fa-times</v-icon> clear list</a>
            </div>
          </div>
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
import path from 'path'
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
    async loadFromFile () {
      try {
        await this.$store.dispatch('game/load', { setupOnly: true })
        this.$emit('load')
      } catch (e) {
        console.error(e)
      }
    },

    async loadSavedSetup (file, create = false) {
      try {
        await this.$store.dispatch('game/load', { file, setupOnly: true })
        if (create) {
          await this.$store.dispatch('gameSetup/createGame')
        } else {
          this.$emit('load')
        }
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
    },

    clearRecentSaves () {
      this.$store.dispatch('settings/clearRecentSaves')
      this.recentSaves = []
    },

    dirname (f) {
      return path.dirname(f) + path.sep
    },

    basename (f) {
      return path.basename(f)
    }
  }
}
</script>

<style lang="sass" scoped>
.content
  display: grid
  grid-template-columns: 1fr 400px

  aside
    +theme using ($theme)
      background: map-get($theme, 'board-bg')

    .load-button
      margin: 60px 0
      text-align: center

    .file-list
      margin-top: 20px

      .clear
        margin-top: 16px
        font-size: 14px
        text-align: center

        i
          color: inherit !important
          font-size: inherit !important

    .file-item
      padding: 0 10px 10px
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.10), 0 3px 10px 0 rgba(0, 0, 0, 0.03)
      margin-bottom: 5px

      +theme using ($theme)
        color: map-get($theme, 'cards-text')
        background-color: map-get($theme, 'cards-bg')
        border: 1px solid #{map-get($theme, 'line-color')}

      .file-name
        flex-grow: 1
        padding-top: 2px
        font-weight: 300
        overflow: hidden
        display: flex
        justify-content: flex-end
        align-items: bottom

        .dirname
          text-overflow: ellipsis
          overflow: hidden
          position: relative
          font-size: 15px
          top: 5.5px

        .basename
          font-size: 20px
          margin-left: 2px

      .buttons
        display: flex
        justify-content: flex-end
        margin-top: 4px

        .v-btn
          margin-left: 6px

          i
            font-size: 14px

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
