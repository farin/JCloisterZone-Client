<template>
  <v-card class="d-flex flex-column">
    <v-card-title class="headline">Settings</v-card-title>
    <v-card-text class="flex-grow-1">
      <div class="d-flex">
        <v-list class="flex-shrink-0">
          <v-list-item-group
            v-model="section"
          >
            <v-list-item>
              <v-list-item-title>Player</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Game Interface</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Apperance</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Add-ons</v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Java</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>

        <div class="px-8 flex-grow-1">
          <template v-if="section === 0">
            <h3 class="mt-2 mb-4">Player</h3>

            <h4>Nickname</h4>
            <em>Nickname used when player is assigned to a game.</em>
            <v-text-field
              v-model="nickname"
              outlined dense
              hide-details
            />

            <h4>Preferred Color</h4>
            <em>Automatically take a color after game join.</em>
            <div class="preferred-color">
              <v-btn small :depressed="preferredColor !== null" @click="() => { preferredColor = null }">None</v-btn>
              <v-btn
                v-for="(n, i) in 9"
                :key="i"
                :class="`color color-${i} color-bg-important color-overlay`"
                small
                :depressed="preferredColor !== i "
                @click="() => { preferredColor = i }"
              >
                <template v-if="preferredColor === i">x</template>
              </v-btn>
            </div>
          </template>
          <template v-if="section === 1">
            <h3 class="mt-2 mb-4">Game Interface</h3>

            <h4>Confirmation</h4>
            <em>
              Confirmation allows player undo performed actions before activity is passed to a next player.
              It happens before scoring or eg. in during opponent turn when you move wagon, etc.
              Enable explicit confirmation&hellip;</em>
            <div class="checkboxes-wrapper">
              <v-checkbox
                v-model="confirmAlways"
                dense hide-details
                label="always"
              />
              <v-checkbox
                v-model="confirmField"
                :disabled="confirmAlways"
                dense hide-details
                label="only when meeple was deployed on a field"
              />
              <v-checkbox
                :disabled="confirmAlways"
                dense hide-details
                label="only when meeple was deployed on a tower"
              />
            </div>

            <h4>Beep</h4>
            <em>Beep when you are on turn (or when your action is required during opponent's turn).</em>
            <div class="checkboxes-wrapper">
              <v-checkbox
                v-model="beep"
                dense hide-details
                label="Enable beep"
              />
            </div>

            <h4>Active player indication</h4>
            <em>Multiple indicators are allowed.</em>
            <div class="checkboxes-wrapper">
              <v-checkbox
                v-model="activePlayerIndicatorBgColor"
                dense hide-details
                label="colored background in right sidebar"
              />
              <v-checkbox
                v-model="activePlayerIndicatorTriangle"
                dense hide-details
                label="triangle in top bar"
              />
            </div>

            <h4>Player List</h4>
            <em>You may enable player list (right sidebar) rotation.</em>
            <v-radio-group
              v-model="playerListRotate"
              dense hide-details
            >
              <v-radio
                label="No rotate"
                value="none"
              />
              <v-radio
                label="Keep active player always on top"
                value="active-on-top"
              />
              <v-radio
                label="Keep local player always on top"
                value="local-on-top"
              />
            </v-radio-group>
          </template>

          <template v-if="section === 2">
            <h3 class="mt-2 mb-4">Apperance</h3>

            <h4>Theme</h4>
            <v-radio-group
              v-model="theme"
              dense hide-details
            >
              <v-radio
                label="Light"
                value="light"
              />
              <v-radio
                label="Dark"
                value="dark"
              />
            </v-radio-group>

            <h4>Artworks</h4>

            <div
              v-for="{ json: artwork } in $theme.installedArtworks"
              :key="artwork.id"
              class="artwork-box"
              :class="{ disabled: !isArtworkEnabled(artwork.id) }"
            >
              <div class="artwork-icon">
                <img v-if="artwork.icon" :src="artwork.icon">
              </div>
              <div>
                <h5>{{ artwork.title }}</h5>
                <p>{{ artwork.description }}</p>
                <p v-if="artwork.artist" class="artist">(illustrated by {{ artwork.artist }})</p>
              </div>
            </div>
          </template>

          <template v-if="section === 3">
            <h3 class="mt-2 mb-4">Add-ons</h3>
          </template>

          <template v-if="section === 4">
            <h3 class="mt-2 mb-4">Java</h3>

            <em>Although JCloisterZone client is pure native application, Java is required to run game engine. In other words to play a game.</em>

            <h4>Java executable</h4>
            <em>You can set manually path to {{ platform === 'win32' ? 'java.exe' : 'java binary' }}</em>

            <template v-if="javaPath === null">
              <span class="v-label">Using system default.</span> <v-btn color="secondary" small @click="selectJava">Change</v-btn>
            </template>
            <template v-else>
              <span class="v-label">Selected: {{ javaPath }}</span>
              <br>
              <v-btn color="secondary" small @click="resetJava">Reset</v-btn>
            </template>

            <div class="mt-4">
              <v-alert v-if="notJavaError" type="warning" dense>
                File doesn't look like a java binary.
              </v-alert>
              <span v-else-if="java">
                Java version {{ java.version }}
              </span>
              <v-alert v-else type="warning" dense>
                Java not found.
              </v-alert>
            </div>
          </template>
        </div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn text @click="$emit('close')">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import path from 'path'
import { ipcRenderer } from 'electron'
import { mapState } from 'vuex'

export default {
  data () {
    return {
      section: 0,
      platform: process.platform,
      notJavaError: false
    }
  },

  computed: {
    ...mapState({
      java: state => state.java,
      engine: state => state.engine
    }),

    nickname: {
      get () { return this.$store.state.settings.nickname },
      set (val) { this.$store.dispatch('settings/update', { nickname: val }) }
    },

    preferredColor: {
      get () { return this.$store.state.settings.preferredColor },
      set (val) { this.$store.dispatch('settings/update', { preferredColor: val }) }
    },

    confirmAlways: {
      get () { return this.$store.state.settings['confirm.always'] },
      set (val) { this.$store.dispatch('settings/update', { 'confirm.always': val }) }
    },

    confirmField: {
      get () { return this.$store.state.settings['confirm.field'] },
      set (val) { this.$store.dispatch('settings/update', { 'confirm.field': val }) }
    },

    confirmTower: {
      get () { return this.$store.state.settings['confirm.tower'] },
      set (val) { this.$store.dispatch('settings/update', { 'confirm.tower': val }) }
    },

    beep: {
      get () { return this.$store.state.settings.beep },
      set (val) { this.$store.dispatch('settings/update', { beep: val }) }
    },

    activePlayerIndicatorBgColor: {
      get () { return this.$store.state.settings.activePlayerIndicatorBgColor },
      set (val) { this.$store.dispatch('settings/update', { activePlayerIndicatorBgColor: val }) }
    },

    activePlayerIndicatorTriangle: {
      get () { return this.$store.state.settings.activePlayerIndicatorTriangle },
      set (val) { this.$store.dispatch('settings/update', { activePlayerIndicatorTriangle: val }) }
    },

    playerListRotate: {
      get () { return this.$store.state.settings.playerListRotate },
      set (val) { this.$store.dispatch('settings/update', { playerListRotate: val }) }
    },

    theme: {
      get () { return this.$store.state.settings.theme },
      set (val) { this.$store.dispatch('settings/update', { theme: val }) }
    },

    javaPath: {
      get () { return this.$store.state.settings.javaPath },
      set (val) { this.$store.dispatch('settings/update', { javaPath: val }) }
    }
  },

  methods: {
    clean () {
      this.notJavaError = false
    },

    async selectJava () {
      const opts = {
        title: 'Select java executable',
        properties: ['openFile']
      }
      if (this.platform === 'win32') {
        opts.filters = [{ name: 'Executable', extensions: ['exe'] }]
      }
      const { filePaths } = await ipcRenderer.invoke('dialog.showOpenDialog', opts)
      if (filePaths.length) {
        const f = filePaths[0]
        if (['java', 'java.exe', 'javaw.exe'].includes(path.basename(f))) {
          this.notJavaError = false
          this.javaPath = f
          await this.$store.dispatch('checkJavaVersion', true)
          this.verifyEngineIfNeeded()
        } else {
          this.notJavaError = true
        }
      }
    },

    async resetJava () {
      this.javaPath = null
      this.notJavaError = false
      await this.$store.dispatch('checkJavaVersion', true)
      this.verifyEngineIfNeeded()
    },

    verifyEngineIfNeeded () {
      if (!this.engine && this.java?.ok) {
        this.$store.dispatch('checkEngineVersion')
      }
    },

    isArtworkEnabled (id) {
      return this.$store.state.settings.enabledArtworks.includes(id)
    }
  }
}

</script>

<style lang="sass" scoped>
.v-list
  width: 160px

h3
  font-weight: 300
  font-size: 16px
  text-transform: uppercase
  text-align: center

  +theme using ($theme)
    color: map-get($theme, 'gray-text-color')

h4
  font-size: 1rem
  font-weight: 600
  margin-top: 20px

em
  display: block
  margin-bottom: 2px

.preferred-color
  display: flex

  .v-btn
    margin-right: 3px

    &.color
      padding: 0 !important
      min-width: 30px !important

.checkboxes-wrapper .v-input, .v-input--radio-group
  margin-top: 0

.v-radio
  margin-bottom: 4px !important

.artwork-box
  display: flex
  padding: 16px
  margin-top: 20px

  +theme using ($theme)
    background: map-get($theme, 'board-bg')

  h5
    font-size: 16px
    margin-bottom: 10px

  p
    margin-bottom: 2px

  .artwork-icon
    width: 120px
    height: 120px
    margin-right: 16px

    +theme using ($theme)
      background: map-get($theme, 'cards-bg')

    img
      object-fit: cover
      max-width: 100%

  &.disabled
    filter: grayscale(100%)

    p
      opacity: 0.75

</style>
