<template>
  <div :class="`player-slot color-${number} ${slotState}`" @click="toggle">
    <div
      v-if="order !== null"
      :class="`order order-${order}`"
    >
      {{ order }}
    </div>
    <svg class="meeple" :width="105" :height="105">
      <use :href="`${MEEPLES_SVG}#small-follower`" />
    </svg>
    <div class="state">
      <template v-if="slotState === 'open'">open slot</template>
      <template v-if="slotState === 'local'">local player</template>
      <template v-if="slotState === 'remote'">remote player</template>
    </div>
    <div 
      v-if="slotState === 'local'"
      class="name"
      @click.stop="openEdit"
    >      
      {{ name }}
      <v-icon v-if="slotState === 'local'">fas fa-pencil-alt</v-icon>
    </div>
    <div v-else class="name">
      <template v-if="slotState === 'open'">click to assign</template>      
      <template v-else>{{ name}}</template>
    </div>

    <v-dialog v-model="edit" max-width="600px">      
      <v-card>
        <v-card-title>
          <span class="headline">Rename Player</span>
        </v-card-title>
        <v-card-text>
          <v-container>
              <v-text-field label="Name" v-model="editName"></v-text-field>              
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="edit = false">Cancel</v-btn>
          <v-btn text @click="rename()">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import sample from 'lodash/sample'
import { mapState } from 'vuex'

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  props: {
    number: { type: Number, required: true },
    owner: { type: String, default: null },
    name: { type: String, default: null },
    order: { type: Number, default: null }
  },

  data () {
    return { 
      MEEPLES_SVG,
      edit: false,
      editName: null
    }
  },

  computed: {
    ...mapState({
      sessionId: state => state.networking.sessionId
    }),

    slotState () {
      if (this.owner === this.sessionId) {
        return 'local'
      }
      return this.owner ? 'remove' : 'open'
    }
  },

  methods: {
    toggle () {
      const { number } = this
      if (this.slotState === 'local') {        
        this.$store.dispatch('gameSetup/releaseSlot', { number })                
      } else if (this.slotState === 'open') {
        this.$store.dispatch('gameSetup/takeSlot', { number })
      }      
    },

    openEdit () {
      this.editName = this.name
      this.edit = true
    },

    rename () {          
      if (this.editName !== this.name) {
        this.$store.dispatch('gameSetup/renameSlot', { number: this.number, name: this.editName })
      }
      this.edit = false
    }
  }
}
</script>

<style lang="sass" scoped>
.player-slot
  position: relative
  background: white
  padding: 40px 0 30px 0

  display: flex
  flex-direction: column
  align-items: center
  overflow: hidden

  .order
    position: absolute
    top: -70px
    right: -37px
    color: white
    font-size: 224px
    font-weight: 900
    opacity: 0.4
    z-index: 1

  .order-1
    right: -48px

  .order-4
    right: -34px

  svg
    margin-bottom: 30px

  .state
    font-size: 24px
    text-transform: uppercase
    font-weight: 300
    color: #444
    margin-bottom: 15px

  .name
    font-size: 24px
    height: 36px
    width: 100%
    text-align: center
    z-index: 2

    i
      visibility: hidden

    &:hover i
      visibility: visible

  &.open
    .name
      font-size: 16px
      font-style: italic
      padding-top: 8px
      color: #444

  &.open, &.local
    cursor: pointer

  &.local
    background: $selection-bg
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15), 0 3px 10px 0 rgba(0, 0, 0, 0.10)        
</style>
