<template>
  <v-card class="d-flex flex-column">
    <v-card-title class="headline">Settings</v-card-title>
    <v-card-text class="flex-grow-1">
      <div class="d-flex">
        <v-list class="flex-shrink-0">
          <v-list-item-group
            v-model="section"
            color="secondary"
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
                <template v-else>&nbsp;</template>
              </v-btn>
            </div>
          </template>
          <template v-if="section === 1">
            <h3 class="mt-2 mb-4">Game Interface</h3>

            <h4>End turn confirmation</h4>
            <em>Confirmation allows player undo performed action actions before activity is passed to a next player.
                Enable explicit confirmation at the turn end&hellip;</em>
            <div class="checkboxes-wrapper">
              <v-checkbox
                v-model="confirmAlways"
                dense hide-details
                label="After each turn"
              />
              <v-checkbox
                v-model="confirmField"
                :disabled="confirmAlways"
                dense hide-details
                label="When meeple was deployed on a field"
              />
              <v-checkbox
                :disabled="confirmAlways"
                dense hide-details
                label="When meeple was deployed on a tower"
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
          </template>

          <template v-if="section === 2">
            <h3 class="mt-2 mb-4">Apperance</h3>

            <h4>Theme</h4>
            <v-radio-group
              v-model="theme"
              @change="onThemeChange"
            >
              <v-radio
                label="Light"
                value="light"
              ></v-radio>
              <v-radio
                label="Dark"
                value="dark"
              ></v-radio>
            </v-radio-group>
          </template>

          <template v-if="section === 3">
            <h3 class="mt-2 mb-4">Java</h3>

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
      <v-spacer></v-spacer>
      <v-btn
        color="secondary"
        text
        @click="$emit('close')"
      >Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import path from 'path'
import { remote } from 'electron'
import { mapState } from 'vuex'

export default {
  data () {
    return {
      section: 0,
      platform: process.platform,
      notJavaError: false,
    }
  },

  computed: {
    ...mapState({
      java: state => state.java,
    }),

    nickname: {
      get () { return this.$store.state.settings.nickname },
      set (val) { this.$store.dispatch('settings/update', { nickname: val })}
    },

    preferredColor: {
      get () { return this.$store.state.settings.preferredColor },
      set (val) { this.$store.dispatch('settings/update', { preferredColor: val })}
    },

    confirmAlways: {
      get () { return this.$store.state.settings['confirm.always'] },
      set (val) { this.$store.dispatch('settings/update', { 'confirm.always': val })}
    },

    confirmField: {
      get () { return this.$store.state.settings['confirm.field'] },
      set (val) { this.$store.dispatch('settings/update', { 'confirm.field': val })}
    },

    confirmTower: {
      get () { return this.$store.state.settings['confirm.tower'] },
      set (val) { this.$store.dispatch('settings/update', { 'confirm.tower': val })}
    },

    beep: {
      get () { return this.$store.state.settings.beep},
      set (val) { this.$store.dispatch('settings/update', { beep: val })}
    },

    theme: {
      get () { return this.$store.state.settings.theme},
      set (val) { this.$store.dispatch('settings/update', { theme: val })}
    },

    javaPath: {
      get () { return this.$store.state.settings.javaPath},
      set (val) { this.$store.dispatch('settings/update', { javaPath: val })}
    }
  },

  methods: {
    clean () {
      this.notJavaError = false;
    },

    onThemeChange (val) {
      // netive theme requires electron 10
      // nativeTheme.themeSource = val
      this.$vuetify.theme.dark = val === 'dark'
    },

    async selectJava () {
      const { dialog } = remote
      const opts = {
        title: 'Select java executable',
        properties: ['openFile']
      }
      if (this.platform === 'win32') {
        opts.filters =  [{ name: 'Executable', extensions: ['exe'] }]
      }
      const { filePaths } = await dialog.showOpenDialog(opts)
      if (filePaths.length) {
        const f = filePaths[0];
        if (['java', 'java.exe', 'javaw.exe'].includes(path.basename(f))) {
          this.notJavaError = false
          this.javaPath = f
          await this.$store.dispatch('checkJavaVersion', true)
        } else {
          this.notJavaError = true
        }
      }
    },

    async resetJava () {
      this.javaPath = null
      this.notJavaError = false
      await this.$store.dispatch('checkJavaVersion', true)
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

.checkboxes-wrapper
  .v-input
    margin-top: 0
</style>
