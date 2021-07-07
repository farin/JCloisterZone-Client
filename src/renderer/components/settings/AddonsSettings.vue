<template>
  <div>
    <h3 class="mt-2 mb-4">Add-ons</h3>

    <label
      for="addon-input"
      :class="{ dragover: dragover }"
      @dragover.prevent="onDragover"
      @dragleave="onDragleave"
      @drop="onDrop"
    >
      Drag add-on here or click to select a file.
    </label>
    <input
      id="addon-input"
      ref="addonInput"
      type="file"
      accept=".jca"
      @change="selectFile"
    >

    <h4>Installed add-ons</h4>

    <AddonBox
      v-for="addon in $addons.addons"
      :key="addon.id"
      :addon="addon"
    />
  </div>
</template>

<script>
import AddonBox from '@/components/settings/AddonBox'

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
      await this.install(files)
      this.dragover = false
    },

    async selectFile ($ev) {
      await this.install(Array.from($ev.target.files))
      this.$refs.addonInput.value = ''
    },

    async install (files) {
      for (const f of files) {
        await this.$addons.install(f)
      }
    }
  }
}
</script>

<style lang="sass" scoped>
label
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

#addon-input
  display: none
</style>
