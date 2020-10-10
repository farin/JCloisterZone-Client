<template>
  <div class="annotations-panel"
  >
    <h5>Development Panel</h5>
    <div class="annotations-panel-content">
      <div class="draw-order">
        <h6>Draw Order</h6>
        <i>
          Click on tiles above to select draw order.
        </i>
        <StandaloneTileImage
          v-for="(id, idx) in drawOrder"
          :key="idx"
          :tile-id="id"
          :size="40"
        />
        <div>
          <v-btn text @click="drawOrder = []">Clear</v-btn>
        </div>
      </div>
      <div>
        <h6>Premature end</h6>
        <i>
          Limits number of tiles after game will be ended.
          Useful for final scoring testing.
        </i>
        <v-text-field
          v-model="limitPackSize"
          label="Game Turns Limit"
        />
      </div>
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
      visible: false
    }
  },

  computed: {
    annotations () {
      const annotations = {}
      if (this.drawOrder.length) {
        annotations.drawOrder = [...this.drawOrder]
      }
      if (this.limitPackSize) {
        annotations.endTurn = parseInt(this.limitPackSize)
      }
      return annotations
    }
  },

  watch: {
    annotations (val) {
      this.$store.commit('gameSetup/gameAnnotations', val)
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
  margin-top: 20px
  min-height: 200px
  border: 1px solid #AD1457

  .annotations-panel-content
    margin: 20px

  h5
    padding: 6px 0
    text-align: center
    background-color: #AD1457
    color: white
    text-transform: uppercase

  h6
    font-weight: 300
    font-size: 16px
    text-transform: uppercase
    margin-top: 20px

    +theme using ($theme)
       color: map-get($theme, 'gray-text-color')

  i
    display: block
    font-size: 11px
    line-height: 1.2
    margin: 5px 0

  .draw-order
    margin-top: 20px
</style>
