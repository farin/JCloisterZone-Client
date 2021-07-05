<template>
  <div>
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
  </div>
</template>

<script>

export default {
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
    }
  }
}
</script>
