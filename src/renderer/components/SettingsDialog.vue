<template>
  <v-card class="d-flex flex-column">
    <v-card-title class="headline">Settings</v-card-title>
    <v-card-text class="flex-grow-1">
      <div class="d-flex">
        <v-list class="flex-shrink-0">
          <v-list-item-group v-model="section" mandatory>
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

        <div class="px-8 flex-grow-1 settings-dialog-content">
          <PlayerSettings v-if="section === 0" />
          <GameInterfaceSettings v-else-if="section === 1" />
          <ApperanceSettings v-else-if="section === 2" />
          <AddonsSettings v-else-if="section === 3" />
          <JavaSettings v-else-if="section === 4" ref="javaSettings" />
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
import AddonsSettings from '@/components/settings/AddonsSettings'
import ApperanceSettings from '@/components/settings/ApperanceSettings'
import GameInterfaceSettings from '@/components/settings/GameInterfaceSettings'
import JavaSettings from '@/components/settings/JavaSettings'
import PlayerSettings from '@/components/settings/PlayerSettings'

export default {
  components: {
    AddonsSettings,
    ApperanceSettings,
    GameInterfaceSettings,
    JavaSettings,
    PlayerSettings
  },

  data () {
    return {
      section: 0
    }
  },

  methods: {
    clean () {
      this.$refs.javaSettings?.clean()
    }
  }
}

</script>

<style lang="sass">
.settings-dialog-content
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

  .checkboxes-wrapper .v-input, .v-input--radio-group
    margin-top: 0

  .v-radio
    margin-bottom: 4px !important
</style>
