<template>
  <v-card>
    <v-card-title class="headline">
      <ExpansionSymbol :expansion="expansion" :style="{ width: 32, height: 32 }" />
      &ensp;
      {{ expansion.title }}
    </v-card-title>
    <v-card-text>
      <component :is="detailComponent" />
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
        text
        @click="$emit('close')"
      >Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import AbbeyAndMayorDetail from '@/components/game-setup/details/AbbeyAndMayorDetail'
import BasicGameDetail from '@/components/game-setup/details/BasicGameDetail'
import BridgesCastlesAndBazaarsDetail from '@/components/game-setup/details/BridgesCastlesAndBazaarsDetail'
import CornCirclesDetail from '@/components/game-setup/details/CornCirclesDetail'
import CountDetail from '@/components/game-setup/details/CountDetail'
import CultDetail from '@/components/game-setup/details/CultDetail'
import DarmstadtDetail from '@/components/game-setup/details/DarmstadtDetail'
import ExpansionSymbol from '@/components/ExpansionSymbol'
import FerriesDetail from '@/components/game-setup/details/FerriesDetail'
import FestivalDetail from '@/components/game-setup/details/FestivalDetail'
import FlierDetail from '@/components/game-setup/details/FlierDetail'
import GoldminesDetail from '@/components/game-setup/details/GoldminesDetail'
import GQ11Detail from '@/components/game-setup/details/GQ11Detail'
import HillsAndSheepDetail from '@/components/game-setup/details/HillsAndSheepDetail'
import InnsAndCathedralsDetail from '@/components/game-setup/details/InnsAndCathedralsDetail'
import KingAndRobberDetail from '@/components/game-setup/details/KingAndRobberDetail'
import LabyrinthDetail from '@/components/game-setup/details/LabyrinthDetail'
import MageAndWitchDetail from '@/components/game-setup/details/MageAndWitchDetail'
import MonasteriesDetail from '@/components/game-setup/details/MonasteriesDetail'
import PrincessAndDragonDetail from '@/components/game-setup/details/PrincessAndDragonDetail'
import RiverDetail from '@/components/game-setup/details/RiverDetail'
import RussianPromosDetail from '@/components/game-setup/details/RussianPromosDetail'
import SiegeDetail from '@/components/game-setup/details/SiegeDetail'
import SpielDochDetail from '@/components/game-setup/details/SpielDochDetail'
import TunnelDetail from '@/components/game-setup/details/TunnelDetail'
import TowerDetail from '@/components/game-setup/details/TowerDetail'
import TradersAndBuildersDetail from '@/components/game-setup/details/TradersAndBuildersDetail'
import WinterEditionDetail from '@/components/game-setup/details/WinterEditionDetail'
import WindRosesDetail from '@/components/game-setup/details/WindRosesDetail'


export default {
  props: {
    expansion: { type: Object, required: true }
  },

  components: {
    ExpansionSymbol
  },

  computed: {
    detailComponent () {
      return {
        'ABBEY_AND_MAYOR': AbbeyAndMayorDetail,
        'BASIC': BasicGameDetail,
        'BRIDGES_CASTLES_AND_BAZAARS': BridgesCastlesAndBazaarsDetail,
        'CORN_CIRCLES': CornCirclesDetail,
        'COUNT': CountDetail,
        'CULT': CultDetail,
        'DARMSTADT': DarmstadtDetail,
        'FERRIES': FerriesDetail,
        'FESTIVAL': FestivalDetail,
        'FLIER': FlierDetail,
        'GOLDMINES': GoldminesDetail,
        'GQ11': GQ11Detail,
        'HILLS_AND_SHEEP': HillsAndSheepDetail,
        'INNS_AND_CATHEDRALS': InnsAndCathedralsDetail,
        'KING_AND_ROBBER': KingAndRobberDetail,
        'LABYRINTH': LabyrinthDetail,
        'MAGE_AND_WITCH': MageAndWitchDetail,
        'MONASTERIES': MonasteriesDetail,
        'PRINCESS_AND_DRAGON': PrincessAndDragonDetail,
        'RIVER': RiverDetail,
        'RUSSIAN_PROMOS': RussianPromosDetail,
        'SIEGE': SiegeDetail,
        'SPIEL_DOCH': SpielDochDetail,
        'TOWER': TowerDetail,
        'TUNNEL': TunnelDetail,
        'TRADERS_AND_BUILDERS': TradersAndBuildersDetail,
        'WINTER': WinterEditionDetail,
        'WIND_ROSES': WindRosesDetail
      }[this.expansion.name]
    }
  }
}

</script>

<style lang="sass" scoped>
.exp-symbol
  +theme using ($theme)
    fill: map-get($theme, 'text-color')
</style>
