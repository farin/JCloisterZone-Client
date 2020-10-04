<template>
  <v-card>
    <v-card-title class="headline">Settings</v-card-title>
    <v-card-text>
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
              <v-list-item-title>Game</v-list-item-title>
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
            <h3 class="mt-2 mb-4">Interface</h3>
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
  font-weight: 500  

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
</style>
