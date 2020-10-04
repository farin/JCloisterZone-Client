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
            <div class="action-confirmation">
              <v-checkbox
                v-model="confirmAlways"
                dense hide-details
                label="after each turn"
              />
              <v-checkbox
                v-model="confirmField"
                :disabled="confirmAlways"
                dense hide-details
                label="when meeple was deployed on a field"
              />
              <v-checkbox
                v-model="confirmTower"
                :disabled="confirmAlways"
                dense hide-details
                label="when meeple was deployed on a tower"
              />

            </div>
          </template>

          <template v-if="section === 2">
            <h3 class="mt-2 mb-4">Apperance</h3>
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

export default {
  data () {
    return {
      section: 0
    }
  },

  computed: {
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
    }
  }
}

</script>

<style lang="sass" scoped>
.v-list
  width: 160px

h3
  color: $color-gray
  font-weight: 300
  font-size: 16px
  text-transform: uppercase
  text-align: center

h4
  font-size: 1rem
  font-weight: 600

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

.action-confirmation
  .v-input
    margin-top: 0
</style>
