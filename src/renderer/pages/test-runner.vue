<template>
  <div class="test-runner">
    <div class="close">
      <NuxtLink to="/">Close</NuxtLink>
    </div>
    <v-container>
      <h1>Test Runner</h1>

      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">
                Test
              </th>
              <th class="text-left" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="test in tests"
              :key="test.file"
            >
              <td>{{ test.name }}</td>
              <td>
                <v-btn small color="secondary" @click="open(test.file)">Open</v-btn>
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

  methods: {
    open (file) {
      this.$store.dispatch('game/load', file)
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
