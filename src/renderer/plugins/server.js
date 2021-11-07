import Vue from 'vue'
import { ipcRenderer } from 'electron'

import { getAppVersion } from '@/utils/version'
import { randomId } from '@/utils/random'

export default ({ app }, inject) => {
  let running = false

  Vue.prototype.$server = {
    async start (game) {
      const { settings } = app.store.state
      const appVersion = getAppVersion()
      const engineVersion = app.store.state.engine.version
      if (!game.gameId) {
        game = { gameId: randomId(), ...game }
      }

      await ipcRenderer.invoke('localserver.start', {
        game,
        port: settings.port,
        clientId: settings.clientId,
        appVersion,
        engineVersion
      })
      running = true
    },

    async stop () {
      running = false
      await ipcRenderer.invoke('localserver.stop')
    },

    isRunning () {
      return running
    },

    async dump () {
      return await ipcRenderer.invoke('localserver.dump')
    }
  }
}
