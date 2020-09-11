<template>
  <div
    :class="{ 'annotations-panel': true, visible }"
    @click="visible = true"
  >
    <h5>DEVELOPEMENT PANEL</h5>
    <div>
      Initial seed:
      <v-btn :color="seed == null ? 'accent' : null" @click="seed = null">Random</v-btn>
      <v-btn :color="seed == '-6476999185744582589' ? 'accent' : null" @click="seed = '-6476999185744582589'">City End</v-btn>
      <v-btn :color="seed == '-1507029652130839674' ? 'accent' : null" @click="seed = '-1507029652130839674'">Cloister</v-btn>
      <v-btn :color="seed == '5898276208915289755' ? 'accent' : null" @click="seed = '5898276208915289755'">Volcano / Move / Princes</v-btn>
    </div>
    <div class="draw-order">
      Draw Order:
      <StandaloneTileImage
        v-for="(id, idx) in drawOrder"
        :key="idx"
        :tile-id="id"
        :size="40"
      />
      <v-btn text @click="drawOrder = []">Clear</v-btn>
    </div>
    <div>
      <v-text-field
        v-model="limitPackSize"
        label="Limit Pack Size"
      />
    </div>
  </div>
</template>

<script>
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

export default {
  components: {
    StandaloneTileImage
  },

  data () {
    return {
      limitPackSize: '',
      drawOrder: [],
      seed: null,
      visible: false
    }
  },

  computed: {
    annotations () {
      if (!this.limitPackSize && !this.drawOrder.length) {
        return {}
      }
      const annotations = {
        tilePack: {
          className: 'com.jcloisterzone.debug.ForcedDrawTilePack',
          params: {
            drawOrder: [...this.drawOrder]
          }
        }
      }
      if (this.limitPackSize) {
        annotations.tilePack.params.drawLimit = parseInt(this.limitPackSize)
      }
      return annotations
    }
  },

  watch: {
    annotations (val) {
      this.$store.commit('game/gameAnnotations', val)
    },

    seed (val) {
      this.$store.commit('game/initialSeed', val)
    }
  },

  methods: {
    appendTile (tlleId) {
      this.drawOrder.push(tlleId)
    }
  }
}
</script>

<style lang="sass" scoped>
.annotations-panel
  border-top: 1px solid black
  margin-top: 20px
  opacity: 0.1
  min-height: 200px

  &.visible
    opacity: 1

  h5
    margin: 10px 0 20px 0
    text-align: center

  .draw-order
    margin-top: 20px
</style>
