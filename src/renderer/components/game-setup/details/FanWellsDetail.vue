<template>
  <div>
    <TileDistribution :sets="{'fan-wells:1': 1}" />

  </div>
</template>

<script>
import TileDistribution from '@/components/TileDistribution'

export default {
  components: {
    TileDistribution
  }
}
</script>

<style lang="sass" scoped>
</style>
