<template>
  <div :class="'tile-auctioned' + (noAuction ? ' no-auction' : '')">
    <div class="points-wrapper">
      <div :class="'points ' + colorCssClass(ev.auctioneer)">{{ noAuction ? '' : -ev.points }}</div>
      <div v-if="ev.bidder !== undefined" :class="'points ' + colorCssClass(ev.bidder)">{{ noAuction ? '' : ev.points }}</div>
    </div>
    <StandaloneTileImage :tile-id="ev.tile" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import StandaloneTileImage from '@/components/game/StandaloneTileImage'

export default {
  components: {
    StandaloneTileImage
  },

  props: {
    ev: { type: Object, required: true }
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    }),

    ...mapState({
      noAuction: state => state.game.setup.rules['bazaar-no-auction']
    })
  }
}
</script>

<style lang="sass" scoped>
.tile-auctioned
  display: flex
  position: relative

  .tile-img
    margin-left: 26px

.points-wrapper
  position: absolute

.points
  width: 30px
  height: 20px
  text-align: center
  font-size: 14px
  border-radius: 10px

.no-auction
  .points
    width: 20px

  .tile-img
    margin-left: 16px
</style>
