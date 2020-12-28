<template>
  <v-card class="about">
    <v-card-title class="headline">Join Remote Game</v-card-title>
    <v-card-text>
      Connect to remote host with created game.<br>
      <i>The must on remote host must be in color selection phase.</i>
      <div class="field-wrapper">
        <v-progress-linear
          v-if="connecting"
          indeterminate
        />
        <v-text-field
          v-else
          v-model="host"
          label="Host"
          @keydown.enter="connect"
        />
        <v-alert
          v-if="error"
          type="error"
          dense
        >
          {{ error }}
        </v-alert>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        text
        :disabled="host.trim() === ''"
        @click="connect"
      >
        Connect
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {

  data () {
    const recent = this.$store.state.settings.recentJoinedGames
    return {
      connecting: false,
      error: null,
      host: recent[0] || ''
    }
  },

  methods: {
    async connect () {
      this.connecting = true
      this.error = null
      try {
        await this.$store.dispatch('networking/connect', { host: this.host, connectionType: 'direct' })
        this.$store.dispatch('settings/addRecentJoinedGame', this.host)
        this.connecting = false
        this.$emit('close')
      } catch (e) {
        this.connecting = false
        if (e.error?.errno === 'EAI_AGAIN') {
          this.error = "Can't resolve host"
        } else if (e.error?.errno === 'ECONNREFUSED') {
          this.error = 'Connection refused'
        } else {
          this.error = e.message || 'Connection failed'
        }
        console.error(e)
      }
    }
  }
}

</script>

<style lang="sass" scoped>
.field-wrapper
  padding-top: 20px
  height: 120px
</style>
