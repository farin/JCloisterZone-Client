<template>
  <div>
    <h3 class="mt-2 mb-4">{{ $t('settings.game-interface.title') }}</h3>
    <h4>{{ $t('settings.game-interface.localization') }}</h4>
    <v-select
      v-model="locale"
      class="locale"
      :items="LOCALES"
      return-object
      single-line
    >
      <template slot="selection" slot-scope="data">
        <svg v-if="data.item.flag" class="flag" :width="18" :height="12">
          <use :href="`${FLAGS_SVG}#${data.item.flag}`" />
        </svg>
        {{ data.item.text }}
      </template>
      <template slot="item" slot-scope="data">
        <svg v-if="data.item.flag" class="flag"  :width="18" :height="12">
          <use :href="`${FLAGS_SVG}#${data.item.flag}`" />
        </svg>
        {{ data.item.text }}
      </template>
    </v-select>

    <h4>{{ $t('settings.game-interface.turn-confirmation') }}</h4>
    <em>{{ $t('settings.game-interface.turn-confirmation-description') }}</em>
    <div class="checkboxes-wrapper">
      <v-checkbox
        v-model="confirmAlways"
        dense hide-details
        :label="$t('settings.game-interface.always-enabled')"
      />
      <v-checkbox
        v-model="confirmField"
        :disabled="confirmAlways"
        dense hide-details
        :label="$t('settings.game-interface.only-when-meeple-was-deployed-on-a-field')"
      />
      <v-checkbox
        :disabled="confirmAlways"
        dense hide-details
        :label="$t('settings.game-interface.only-when-meeple-was-deployed-on-a-tower')"
      />
    </div>

    <h4>{{ $t('settings.game-interface.beep') }}</h4>
    <em>{{ $t('settings.game-interface.beep-description') }}</em>
    <div class="checkboxes-wrapper">
      <v-checkbox
        v-model="beep"
        dense hide-details
        :label="$t('settings.game-interface.enable-beep')"
      />
    </div>

    <h4>{{ $t('settings.game-interface.active-player-indication') }}</h4>
    <em>{{ $t('settings.game-interface.multiple-indicators-are-allowed') }}</em>
    <div class="checkboxes-wrapper">
      <v-checkbox
        v-model="activePlayerIndicatorBgColor"
        dense hide-details
        :label="$t('settings.game-interface.colored-background-in-right-sidebar')"
      />
      <v-checkbox
        v-model="activePlayerIndicatorTriangle"
        dense hide-details
        :label="$t('settings.game-interface.triangle-in-top-bar')"
      />
    </div>

    <h4>{{ $t('settings.game-interface.player-list') }}</h4>
    <em>{{ $t('settings.game-interface.player-list-description') }}</em>
    <v-radio-group
      v-model="playerListRotate"
      dense hide-details
    >
      <v-radio
        :label="$t('settings.game-interface.player-list-no-rotate')"
        value="none"
      />
      <v-radio
        :label="$t('settings.game-interface.player-list-active-on-top')"
        value="active-on-top"
      />
      <v-radio
        :label="$t('settings.game-interface.player-list-local-on-top')"
        value="local-on-top"
      />
    </v-radio-group>
  </div>
</template>

<script>
import { LOCALES } from '@/constants/locales'

const FLAGS_SVG = require('~/assets/flags.svg')

export default {
  data () {
    return {
      FLAGS_SVG,
      LOCALES
    }
  },

  computed: {
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

    locale: {
      get () { return this.$store.state.settings.locale },
      set (locale) {
        this.$store.dispatch('settings/update', { locale: locale.id })
        this.$i18n.setLocale(locale.id)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.v-select
  max-width: 50vw
  margin: 0 auto

.flag
  margin-left: 1ex
  margin-right: 1ex
</style>
