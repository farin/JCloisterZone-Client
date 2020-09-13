<template>
  <v-card class="about">
    <v-card-title class="headline">JCloisterZone</v-card-title>
    <v-card-text>
      <section class="d-flex my-3">
        <div class="meeples d-flex">
          <svg class="meeple small-follower" :width="110" :height="110">
            <use :href="`${MEEPLES_SVG}#small-follower`" />
          </svg>
          <svg class="meeple builder" :width="110" :height="110">
            <use :href="`${MEEPLES_SVG}#builder`" />
          </svg>
          <svg class="meeple barn" :width="110" :height="110">
            <use :href="`${MEEPLES_SVG}#barn`" />
          </svg>
        </div>
        <div>
          <div class="version">version {{ version }}</div>
          Roman Krejčík<br>
          farin@farin.cz
        </div>
      </section>
      <hr>
      <section class="my-3">
        <div class="label">Configuration file</div>
        <div class="value">{{ $store.getters['settings/settingsFile'] }}</div>
        <div class="label">System Java Version</div>
        <div class="value">{{ java ? java.versionString : '' }}</div>
        <div class="label">JCloisteZone Game Engine</div>
        <div class="value">{{ engine ? engine.path : '' }}</div>
        <div class="value">{{ engine ? engine.version : '' }}</div>
      </section>
    </v-card-text>
  </v-card>
</template>

<script>
import { remote } from 'electron'
import { mapState } from 'vuex'

const { app } = remote

const MEEPLES_SVG = require('~/assets/meeples.svg')

export default {
  data () {
    return {
      MEEPLES_SVG,
      version: process.env.NODE_ENV === 'development' ? process.env.npm_package_version : app.getVersion(),
    }
  },

  computed: mapState({
    java: state => state.java,
    engine: state => state.engine
  })
}

</script>

<style lang="sass" scoped>
.about
  .meeples
    margin: 5px 40px 5px 20px

  svg.small-follower
    fill: #FF5722
    z-index: 10

  svg.builder
    fill: #2196F3
    margin-left: -55px
    z-index: 9

  svg.barn
    fill: #8BC34A
    margin-left: -55px
    z-index: 8
    position: relative
    top: 10px

  section
    font-size: 16px

  .version
    font-weight: 500
    font-size: 20px
    margin-bottom: 10px

  .label
    margin-top: 5px

  .value
    margin-left: 20px



  // .version
  //   font-weight: 600
  //   font-size: 18px

  // .author
  //   font-size: 16px
</style>
