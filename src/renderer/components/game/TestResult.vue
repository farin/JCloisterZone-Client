<template>
  <v-card class="test-result">
    <div class="btn-line">
      <v-btn text @click="$store.commit('game/testScenarioResult', null)">close</v-btn>
    </div>
    <div class="description">
      <b>Test:</b><br>
      {{ result.description }}
    </div>
    <div
      v-for="(ar, idx) in result.assertions"
      :key="idx"
      class="d-flex"
      :class="{ case: true, ok: ar.result, fail: !ar.result  }"
    >
      <span class="flex-grow-1 mr-5">{{ ar.assertion }}</span>
      <span class="pr-1">{{ ar.result ? 'OK' : ar.error || 'FAIL' }}</span>
    </div>
  </v-card>
</template>

<script>
export default {
  props: {
    result: { type: Object, required: true }
  }
}
</script>

<style lang="sass" scoped>
.test-result
  background: white
  padding: 30px 50px

  .btn-line
    margin-bottom: 10px

  .description
    margin-bottom: 20px

  .case
    padding: 3px 6px

  .case.ok
    background: #558B2F
    color: white

  .case.fail
    background: #C62828
    color: white
</style>
