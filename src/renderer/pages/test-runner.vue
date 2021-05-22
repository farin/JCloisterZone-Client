<template>
  <div class="test-runner">
    <div class="close">
      <NuxtLink to="/">Close</NuxtLink>
    </div>
    <v-container>
      <h1>Test Runner</h1>

      <v-btn color="secondary" @click="runAll">Run All</v-btn>

      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                Test
              </th>
              <th class="text-left">
                Result
              </th>
              <th class="text-left" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(test, idx) in tests"
              :key="test.file"
            >
              <td>{{ test.name }}</td>
              <td>
                <span v-if="test.result && test.result.ok">OK</span>
                <span v-if="test.result && !test.result.ok">FAIL</span>
              </td>
              <td>
                <v-btn small color="secondary" @click="run(test, idx)">Run</v-btn>
                <v-btn small color="secondary" @click="open(test)">Open</v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-container>
  </div>
</template>

<script>
import fs from 'fs'
import path from 'path'

import Vue from 'vue'
import omit from 'lodash/omit'

export default {
  components: {

  },

  async asyncData () {
    const testFolder = path.join('engine-tests')
    const tests = []
    try {
      const listing = await fs.promises.readdir(testFolder)
      for (const subfolder of listing) {
        const files = await fs.promises.readdir(path.join(testFolder, subfolder))
        files.forEach(f => {
          tests.push({
            name: path.join(subfolder, f).replace('.jcz', ''),
            file: path.join(testFolder, subfolder, f)
          })
        })
      }
    } catch (e) {
      console.log(`test folder ${testFolder} does not exist`)
      return { tests: [] }
    }
    return { tests }
  },

  computed: {
  },

  mounted () {
    this.$store.commit('runningTests', true)
  },

  beforeDestroy () {
    this.$store.commit('runningTests', false)
  },

  methods: {
    open ({ file }) {
      this.$store.commit('runningTests', false)
      this.$store.dispatch('game/load', file)
    },

    async run (test, idx) {
      Vue.set(this.tests, idx, omit(test, ['result']))
      const result = await this.runTest(test.file)
      Vue.set(this.tests, idx, { ...test, result })
    },

    async runAll () {
      this.tests.map(test => omit(test, ['result']))
      for (let idx = 0; idx < this.tests.length; idx++) {
        const test = this.tests[idx]
        const result = await this.runTest(test.file)
        Vue.set(this.tests, idx, { ...test, result })
      }
    },

    runTest (file) {
      return new Promise(resolve => {
        const unsubscribe = this.$store.subscribe(async (mutation, state) => {
          if (mutation.type === 'game/testScenarioResult') {
            unsubscribe()
            await this.$store.dispatch('game/close')
            const failed = mutation.payload.assertions.find(a => a.result === false)
            resolve({
              ...mutation.payload,
              ok: !failed
            })
          }
        })
        this.$store.dispatch('game/load', file)
      })
    }
  }
}
</script>

<style lang="sass" scoped>
h1
  margin-bottom: 20px
.close
 position: absolute
 top: 10px
 right: 10px
</style>
