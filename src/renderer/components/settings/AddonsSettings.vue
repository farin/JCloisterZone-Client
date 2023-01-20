<template>
  <div>
    <h3 class="mt-2 mb-4">{{ $t('settings.add-ons.title') }}</h3>

    <v-alert
      v-if="gameOpen"
      type="warning"
    >
      {{ $t('settings.add-ons.installation-is-not-avoled-during-game') }}
      <br><br>
      {{ $t('settings.add-ons.finish-or-leave-game-to-make-changes') }}
    </v-alert>

    <v-sheet
      v-else
      :class="{ dragzone: true, dragover: dragover }"
      @dragover.prevent="onDragover"
      @dragleave="onDragleave"
      @drop="onDrop"
      @click="selectFile"
    >
      <strong>{{ $t('settings.add-ons.install-add-on') }}</strong>
      <div>{{ $t('settings.add-ons.drag-add-on-here-or-click-here') }}</div>
    </v-sheet>

    <v-alert
      v-model="showAlert"
      class="install-error"
      type="warning"
      dismissible
    >
      <div v-for="(error, idx) in errors" :key="idx">{{ error }}</div>
    </v-alert>

	<i18n path="settings.add-ons.look-at-jcz-for-add-ons" tag="p" class="info-box">
	    <template #link>
	      <a href="https://jcloisterzone.com/addons/" @click.prevent="openLink">https://jcloisterzone.com/addons/</a>
	    </template>
    </i18n>
    <h4>{{ $t('settings.add-ons.installed-add-ons') }}</h4>

    <AddonBox
      v-for="addon in getAddons()"
      :key="addon.id"
      :addon="addon"
      :disabled="gameOpen"
      @uninstall="uninstall(addon)"
    />
  </div>
</template>

<script>
import { shell, ipcRenderer } from 'electron'
import AddonBox from '@/components/settings/AddonBox'
import AddonsReloadObserverMixin from '@/components/AddonsReloadObserverMixin'

const JCA_FILTERS = [{ name: 'JCloisterZone add-on ', extensions: ['jca'] }]

export default {
  components: {
    AddonBox
  },

  mixins: [AddonsReloadObserverMixin],

  data () {
    return {
      showAlert: false,
      errors: [],
      dragover: false
    }
  },

  computed: {
    gameOpen () {
      const routeName = this.$route.name
      return routeName === 'game-setup' || routeName === 'open-game' || routeName === 'game'
    },

    addons () {
      // hide default
      return this.$addons.addons.filter(addon => !addon.hidden)
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
      this.showAlert = false
      this.errors = []
      if (files.length) {
        for (const f of files) {
          try {
            await this.$addons.install(f)
          } catch (e) {
            this.showAlert = true
            this.errors.push(e + '')
          }
        }
      }
    },

    async uninstall (addon) {
      await this.$addons.uninstall(addon)
    },

    openLink (ev) {
      shell.openExternal(ev.target.href)
    },

    afterAddonsReloaded () {
      this.$forceUpdate()
    },

    getAddons () {
      // hide default
      return this.$addons.addons.filter(addon => !addon.hidden)
    }
  }
}
</script>

<style lang="sass" scoped>
.dragzone
  width: 100%
  height: 90px
  border: 2px dashed
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  font-weight: 300
  font-size: 18px
  cursor: pointer
  text-align: center

  strong
    display: block
    margin-bottom: 4px

  div
    font-size: 16px

  +theme using ($theme)
    color: map-get($theme, 'cards-selected-text')
    border-color: map-get($theme, 'cards-selected-text')

  &.dragover
    +theme using ($theme)
      background: map-get($theme, 'cards-selected-bg')

.info-box
  margin-top: 10px
  line-height: 1.2

.install-error
  margin-top: 10px
</style>
