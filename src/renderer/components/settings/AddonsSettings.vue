<template>
  <div>
    <h3 class="mt-2 mb-4">Add-ons</h3>

    <v-sheet
      :class="{ dragzone: true, dragover: dragover }"
      @dragover.prevent="onDragover"
      @dragleave="onDragleave"
      @drop="onDrop"
      @click="selectFile"
    >
      Drag add-on here (.jca file) or click here to select it.
    </v-sheet>

    <h4>Installed add-ons</h4>

    <AddonBox
      v-for="addon in $addons.addons"
      :key="addon.id"
      :addon="addon"
      @uninstall="uninstall(addon)"
    />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'
import AddonBox from '@/components/settings/AddonBox'

const JCA_FILTERS = [{ name: 'JCloisterZone add-on ', extensions: ['jca'] }]

export default {
  components: {
    AddonBox
  },

  data () {
    return {
      dragover: false
    }
  },

  methods: {
    onDragover () {
      this.dragover = true
    },

    onDragleave () {
      this.dragover = false
    },

    async onDrop ($ev) {
      const dt = $ev.dataTransfer
      const files = Array.from(dt.items)
        .map(it => it.getAsFile())
        .filter(it => it !== null)
        .filter(({ name }) => {
          const ext = name.split('.').pop()
          return ext === 'jca'
        })
        .map(f => f.path)
      await this.install(files)
      this.dragover = false
    },

    async selectFile () {
      const { filePaths } = await ipcRenderer.invoke('dialog.showOpenDialog', {
        title: 'Install add-on',
        filters: JCA_FILTERS,
        properties: ['openFile']
      })
      this.install(filePaths)
    },

    async install (files) {
      if (files.length) {
        for (const f of files) {
          await this.$addons.install(f)
        }
      }
      this.$forceUpdate()
    },

    async uninstall (addon) {
      await this.$addons.uninstall(addon)
      this.$forceUpdate()
    }
  }
}
</script>

<style lang="sass" scoped>
.dragzone
  width: 100%
  height: 80px
  border: 2px dashed
  display: flex
  align-items: center
  justify-content: center
  font-weight: 300
  font-size: 18px
  cursor: pointer

  +theme using ($theme)
    color: map-get($theme, 'cards-selected-text')
    border-color: map-get($theme, 'cards-selected-text')

  &.dragover
    +theme using ($theme)
      background: map-get($theme, 'cards-selected-bg')
</style>
