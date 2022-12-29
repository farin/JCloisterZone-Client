<template>
  <div>
    <h3 class="mt-2 mb-4">{{ $t('settings.java.title') }}</h3>

    <em>{{ $t('settings.java.description') }}</em>

    <h4>{{ $t('settings.java.java-executable') }}</h4>
    <em>{{ $t('settings.java.you-may-set-path', [ platform === 'win32' ? 'java.exe' : 'java binary' ]) }}</em>

    <template v-if="javaPath === null">
      <span class="v-label">{{ $t('settings.java.using-system-default') }}</span> <v-btn color="secondary" small @click="selectJava">{{ $t('button.change') }}</v-btn>
    </template>
    <template v-else>
      <span class="v-label">{{ $t('settings.java.selected', [javaPath]) }}</span>
      <br>
      <v-btn color="secondary" small @click="resetJava">{{ $t('button.reset') }}</v-btn>
    </template>

    <div class="mt-4">
      <v-alert v-if="notJavaError" type="warning" dense>
        {{ $t('settings.java.warning-file-is-not-java-binary') }}
      </v-alert>
      <span v-else-if="java">
        {{ $t('settings.java.version', [java.version]) }}
      </span>
      <v-alert v-else type="warning" dense>
        {{ $t('settings.java.warning-java-not-found') }}
      </v-alert>
    </div>
  </div>
</template>

<script>
import path from 'path'
import { ipcRenderer } from 'electron'

import { mapState } from 'vuex'

export default {
  data () {
    return {
      platform: process.platform,
      notJavaError: false
    }
  },

  computed: {
    ...mapState({
      java: state => state.java,
      engine: state => state.engine
    }),

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
    }
  }
}
</script>
