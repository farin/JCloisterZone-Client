import Vue from 'vue'
import remote from '@electron/remote'

import { getAppVersion } from '@/utils/version'
import { randomId } from '@/utils/random'
import GameServer from '@/local-server/server'

export default ({ app }, inject) => {
  let gameServer = null

  Vue.prototype.$server = {
    async start (game) {
      await this.stop()
      const { settings } = app.store.state
      const appVersion = getAppVersion()
      const engineVersion = app.store.state.engine.version
      if (!game.gameId) {
        game = { gameId: randomId(), ...game }
      }
      gameServer = new GameServer(game, settings.clientId, {
        appVersion,
        engineVersion
      })
      gameServer.on('error', err => {
        console.error(err)
        const { dialog } = remote
        let msg
        if (err.errno === 'EADDRINUSE') {
          msg = 'Have you alredy created game from another app instance?'
        } else {
          msg = err.message || '' + err
        }
        dialog.showErrorBox(`Can't start server on port ${settings.port}`, msg)
      })

      await gameServer.start(settings.port)
    },

    async stop () {
      if (gameServer) {
        await gameServer.stop()
        gameServer = null
      }
    },

    isRunning () {
      return gameServer !== null
    },

    getServer () {
      return gameServer
    }
  }
}
