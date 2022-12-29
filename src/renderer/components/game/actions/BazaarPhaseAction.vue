<template>
  <section :class="{['action-' + actionItem.type]: true, local}">
    <span class="text">
      <template v-if="actionItem.type === 'BazaarSelectTile' && !noAuction">{{ $t(local ? 'game.action.bazaar-choose-a-tile-and-your-bid' : 'game.action.bazaar-player-must-choose-a-tile-and-bid')}}</template>
      <template v-else-if="actionItem.type === 'BazaarSelectTile' && noAuction">{{ $t(local ? 'game.action.bazaar-choose-a-tile' : 'game.action.bazaar-player-must-choose-a-tile') }}</template>
      <template v-else-if="actionItem.type === 'BazaarBid'">{{ $t(local ? 'game.action.bazaar-raise-bid-or-pass' : 'game.action.bazaar-player-must-raise-bid-or-pass') }}</template>
      <template v-else-if="actionItem.type === 'BazaarSelectBuyOrSell'">
        {{ $t(local ? 'game.action.bazaar-buy-sell-the-tile-from-to' : 'game.action.bazaar-player-must-buy-sell-the-tile-from-to') }}
      </template>
      <template v-else>{{ actionItem.type }}</template>
    </span>
    <div
      v-if="actionItem.type === 'BazaarSelectBuyOrSell'"
      :class="colorCssClass(bidder)"
    >
      <Meeple type="SmallFollower" />
    </div>
    <div class="bazaar-supply">
      <div
        v-for="(bi, idx) in bazaar"
        :key="idx"
        :class="{
          'bazaar-supply-item': true,
          'available': isNil(bi.owner),
          selected: selected === idx
        }"
        @click="onTileClick(idx)"
      >
        <StandaloneTileImage :tile-id="bi.tile" />
        <svg
          v-if="!isNil(bi.owner)"
          :class="'owner-spot color-fill ' + colorCssClass(bi.owner)"
          stroke="#999"
          stroke-width="1"
          width="24"
          height="24"
        >
          <circle cx="12" cy="12" r="12" />
        </svg>
        <div
          v-if="selected === idx"
          class="auction"
        >
          <template v-if="!noAuction">
            <BidPriceInput v-if="local && actionItem.type !== 'BazaarSelectBuyOrSell'" v-model="bid" :min="actionItem.type === 'BazaarBid' ? bi.price + 1 : bi.price" :max="999" />
            <span v-else class="bid-price">{{ bid }}</span>
          </template>
          <template v-if="local && actionItem.type === 'BazaarSelectTile'">
            <v-btn small color="secondary" @click="makeBid">{{ $t('button.select') }}</v-btn>
          </template>
          <template v-else-if="local && actionItem.type === 'BazaarBid'">
            <v-btn class="left-btn" small color="secondary" @click="makeBid">{{ $t('button.raise') }}</v-btn>
            <v-btn small color="secondary" @click="pass">{{ $t('button.pass') }}</v-btn>
          </template>
          <template v-else-if="local && actionItem.type === 'BazaarSelectBuyOrSell'">
            <v-btn class="left-btn" small color="secondary" @click="buy">{{ $t('button.buy') }}</v-btn>
            <v-btn small color="secondary" @click="sell">{{ $t('button.sell') }}</v-btn>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import isNil from 'lodash/isNil'

import BidPriceInput from '@/components/game/actions/BidPriceInput.vue'
import Meeple from '@/components/game/Meeple'
import StandaloneTileImage from '@/components/game/StandaloneTileImage'

const getInitialData = (item, bazaar) => {
  if (item.type === 'BazaarSelectTile') {
    const remainingCount = bazaar.filter(bi => isNil(bi.owner)).length
    return {
      bid: 0,
      selected: remainingCount === 1 ? bazaar.findIndex(bi => isNil(bi.owner)) : null,
      selectedBy: null,
      bidder: null
    }
  } else {
    const idx = bazaar.findIndex(bi => !isNil(bi.selectedBy))
    const price = bazaar[idx].price
    return {
      bid: item.type === 'BazaarBid' ? price + 1 : price,
      selected: idx,
      selectedBy: bazaar[idx].selectedBy,
      bidder: bazaar[idx].bidder
    }
  }
}

export default {
  components: {
    BidPriceInput,
    Meeple,
    StandaloneTileImage
  },

  props: {
    action: { type: Object, required: true },
    local: { type: Boolean }
  },

  data () {
    return getInitialData(this.action.items[0], this.$store.state.game.bazaar)
  },

  computed: {
    ...mapGetters({
      colorCssClass: 'game/colorCssClass'
    }),

    ...mapState({
      bazaar: state => state.game.bazaar,
      noAuction: state => state.game.setup.rules['bazaar-no-auction']
    }),

    actionItem () {
      return this.action.items[0]
    }
  },

  watch: {
    actionItem (item) {
      Object.assign(this, getInitialData(item, this.bazaar))
    }
  },

  methods: {
    isNil,

    onTileClick (idx) {
      if (this.local && this.actionItem.type === 'BazaarSelectTile' && isNil(this.bazaar[idx].owner)) {
        this.selected = idx
      }
    },

    async makeBid () {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'BAZAAR_BID',
          payload: {
            supplyIndex: this.selected,
            price: this.bid
          }
        })
      }
    },

    async pass () {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'PASS',
          payload: {}
        })
      }
    },

    async buy () {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'BAZAAR_BUY_OR_SELL',
          payload: {
            value: 'BUY'
          }
        })
      }
    },

    async sell () {
      if (this.local) {
        await this.$store.dispatch('game/apply', {
          type: 'BAZAAR_BUY_OR_SELL',
          payload: {
            value: 'SELL'
          }
        })
      }
    }
  }
}
</script>

<style lang="sass" scoped>
.text
  font-size: 20px
  font-weight: 300
  margin-right: 20px

svg.meeple
  position: relative
  left: -10px
  top: 1px
  width: 32px
  height: 32px

.bazaar-supply
  display: flex

  .bazaar-supply-item
    position: relative
    margin: 0 15px
    display: flex

    .owner-spot
      position: absolute
      left: 76px
      top: 10px

  .auction
    border: 1px solid #ccc
    align-self: center
    margin-top: 4px
    padding: 20px 25px
    display: flex
    height: 70px

    .v-input, .bid-price
      position: relative
      width: 55px
      margin-right: 15px
      font-size: 24px

    .v-input
      top: -8px

    .bid-price
      top: -2px
      padding-left: 4px

    .left-btn
      margin-right: 15px

.action-BazaarSelectTile.local
  .bazaar-supply-item.available
    .tile-img:hover
      cursor: pointer
      box-shadow: 2px 2px 5px 0px rgba(0,0,0,1)
</style>
