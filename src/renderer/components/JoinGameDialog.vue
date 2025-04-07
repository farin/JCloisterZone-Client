<template>
  <v-card class="about">
    <v-card-title class="headline">{{ $t('join-game.title') }}</v-card-title>
    <v-card-text>
      {{ $t('join-game.connect-to-remote-host') }}
      <div>
        <i>{{ $t('join-game.description') }}</i>
      </div>
      <div class="field-wrapper">
        <v-progress-linear
          v-if="connecting"
          indeterminate
        />
        <v-text-field
          v-else
          ref="input"
          v-model="host"
          :label="$t('join-game.host')"
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
        @click="$emit('close')"
      >
        {{ $t('button.cancel') }}
      </v-btn>
      <v-btn
        text
        :disabled="host.trim() === ''"
        @click="connect"
      >
        {{ $t('button.connect') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { connectExceptionToMessage } from '@/utils/networking'

export default {

  data () {
    const recent = this.$store.state.settings.recentJoinedGames
    return {
      connecting: false,
      error: null,
      host: recent[0] || ''
    }
  },

  mounted () {
    setTimeout(() => {
      this.$refs.input.focus()
    }, 1)
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
        this.error = connectExceptionToMessage(e)
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
