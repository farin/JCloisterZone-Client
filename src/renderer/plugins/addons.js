import os from 'os'
import fs from 'fs'
import path from 'path'
import https from 'https'

import sortBy from 'lodash/sortBy'
import uniq from 'lodash/uniq'
import isNumber from 'lodash/isNumber'
import unzipper from 'unzipper'
import sha256File from 'sha256-file'
import compareVersions from 'compare-versions'
import Vue from 'vue'

import { getAppVersion } from '@/utils/version'
import { EventsBase } from '@/utils/events'

class Addons extends EventsBase {
  constructor (ctx) {
    super()

    this.AUTO_DOWNLOADED = {
      classic: {
        url: 'https://jcloisterzone.com/packages/classic/classic-4-5.7.0.jca',
        version: 4,
        sha256: '12a21b415b82fabc9b02d54d7cbccdb33393aa99a3de1e172f0281ad6dbbf7b4',
        size: 88733423
      }
    }

    this.ctx = ctx
    this.addons = []
  }

  async loadAddons () {
    console.log('Looking for installed` addons')
    const { settings } = this.ctx.store.state
    const userDataPath = window.process.argv.find(arg => arg.startsWith('--user-data=')).replace('--user-data=', '')

    // clean up 5.6 data
    let oldArtworkDir
    try {
      oldArtworkDir = await fs.promises.stat(path.join(userDataPath, 'artworks'))
    } catch (e) {}
    if (oldArtworkDir?.isDirectory()) {
      try {
        await fs.promises.rmdir(path.join(userDataPath, 'artworks'), { recursive: true })
      } catch (e) {
        console.error('Unable to remove old artwork folder', e)
      }
    }

    const lookupFolders = [
      path.join(userDataPath, 'addons')
      // process.resourcesPath + '/addons/'
    ]

    const installedAddons = []
    const installedAddonsIds = new Set()

    for (const fullPath of settings.userAddons) {
      const addon = await this._readAddon(path.basename(fullPath), fullPath)
      addon.removable = false
      if (addon && !installedAddonsIds.has(addon.id)) {
        installedAddons.push(addon)
        installedAddonsIds.add(addon.id)
      }
    }

    for (const lookupFolder of lookupFolders) {
      let listing
      try {
        listing = await fs.promises.readdir(lookupFolder)
      } catch (e) {
        console.log(`${lookupFolder} does not exist`)
        continue
      }
      for (const id of listing) {
        // when same artwork is on path twice, register first found
        // this allowes overide from user path
        if (!installedAddonsIds.has(id)) {
          const fullPath = path.join(lookupFolder, id)
          const addon = await this._readAddon(id, fullPath)
          addon.removable = id !== 'classic'
          if (addon) {
            installedAddons.push(addon)
            installedAddonsIds.add(id)
          }
        }
      }
    }

    await this.updateOutdated(installedAddons)

    console.log('Installed addons: ', installedAddons.filter(addon => !addon.error))

    for (const addon of installedAddons) {
      if (addon.error) {
        console.error(`Can't load ${addon.id} add-on: ${addon.error}`)
        continue
      }
      addon.artworks = []
      for (const relPath of (addon.json.artworks || [])) {
        const fullPath = path.join(addon.folder, relPath)
        const artwork = await this._readArtwork(addon.id + '/' + path.basename(fullPath), fullPath)
        addon.artworks.push(artwork)
      }
    }

    this.addons = sortBy(installedAddons, ['removable', 'id'])
    this.ctx.app.store.commit('addonsLoaded')
  }

  async mkAddonsFolder () {
    const userDataPath = window.process.argv.find(arg => arg.startsWith('--user-data=')).replace('--user-data=', '')
    const addonsFolder = path.join(userDataPath, 'addons')
    await fs.promises.mkdir(addonsFolder, { recursive: true })
    return addonsFolder
  }

  async install (filePath) {
    const addonsFolder = await this.mkAddonsFolder()

    const tmpFolder = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'addon-'))
    console.log(tmpFolder)

    // TODO UNPACK FIRST TO TEMP DIR AND VALIDATE
    await fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: tmpFolder }))
      .promise()

    const listing = await fs.promises.readdir(tmpFolder)
    if (listing.length !== 1) {
      throw new Error('Invalid addon: package must contain only single folder in root')
    }
    const id = listing[0]
    if (this.addons.find(addon => addon.id === id)) {
      throw new Error(`Addon ${id} is already installed. If you want to reinstall it please remove it first.`)
    }

    const tmpAddonPath = path.join(tmpFolder, id)
    const addon = await this._readAddon(id, tmpAddonPath)
    if (addon.error) {
      throw new Error(addon.error)
    }

    await fs.promises.rename(tmpAddonPath, path.join(addonsFolder, id))

    await fs.promises.rmdir(tmpFolder, { recursive: true })

    const enabledArtworks = uniq([...this.ctx.store.state.settings.enabledArtworks, ...addon.json.artworks.map(artwork => `${id}/${artwork}`)])
    await this.ctx.store.dispatch('settings/update', { enabledArtworks })

    this.emitter.emit('change')
  }

  async uninstall (addon) {
    await fs.promises.rmdir(addon.folder, { recursive: true })

    if (addon.artworks?.length) { // may be undefined for invalid artwork
      const ids = addon.artworks.map(a => a.id)
      const enabledArtworks = this.ctx.store.state.settings.enabledArtworks.filter(id => !ids.includes(id))
      await this.ctx.store.dispatch('settings/update', { enabledArtworks })
    }

    this.emitter.emit('change')
  }

  async updateOutdated (installedAddons) {
    const classicArtwork = installedAddons.find(({ id }) => id === 'classic')
    if (classicArtwork && !classicArtwork.outdated) return

    console.log('Downloading classic artwork.')
    const link = this.AUTO_DOWNLOADED.classic.url
    this.ctx.app.store.commit('download', {
      name: 'classic.jca',
      description: 'Downloading classic artwork',
      progress: null,
      size: null,
      link
    })

    const addonsFolder = await this.mkAddonsFolder()
    const zipName = path.join(addonsFolder, 'classic.jca')
    try {
      if ((await fs.promises.stat(zipName)).isFile()) {
        await fs.promises.unlink(zipName)
      }
    } catch {
      // ignore
    }
    const file = fs.createWriteStream(zipName)
    await new Promise((resolve, reject) => {
      let downloadedBytes = 0
      https.get(link, response => {
        const total = parseInt(response.headers['content-length'])
        this.ctx.app.store.commit('downloadSize', total)
        response.on('data', chunk => {
          downloadedBytes += chunk.length
          this.ctx.app.store.commit('downloadProgress', downloadedBytes)
        })
        response.pipe(file)

        file.on('finish', function () {
          file.close(resolve)
        })
      }).on('error', function (err) { // Handle errors
        fs.unlink(zipName) // Delete the file async. (But we don't check the result)
        reject(err.message)
      })
    })
    const checksum = sha256File(zipName)
    if (checksum !== this.AUTO_DOWNLOADED.classic.sha256) {
      console.log('classic.jca checksum mismatch ' + checksum)
      this.ctx.app.store.commit('download', {
        name: 'classic.jca',
        description: 'Error: Downloaded file has invalid checksum',
        progress: 0,
        size: this.AUTO_DOWNLOADED.classic.size,
        link
      })
      await fs.promises.unlink(zipName)
    } else {
      console.log('classic.jca downloaded. sha256: ' + checksum)
      if (classicArtwork?.outdated) {
        console.log('Removing outdated artwork ' + classicArtwork.folder)
        await fs.promises.rmdir(classicArtwork.folder, { recursive: true })
      }
      await fs.createReadStream(zipName)
        .pipe(unzipper.Extract({ path: addonsFolder }))
        .promise()
      await fs.promises.unlink(zipName)
      this.ctx.app.store.commit('download', null)
    }

    const fullPath = path.join(addonsFolder, 'classic')
    const artwork = await this._readAddon('classic', fullPath)
    if (classicArtwork) {
      Object.assign(classicArtwork, artwork)
    } else {
      installedAddons.unshift(artwork)
    }
  }

  async _readAddon (id, fullPath) {
    const stats = await fs.promises.stat(fullPath)
    if (stats.isDirectory()) {
      const jsonPath = path.join(fullPath, 'jcz-addon.json')
      let json
      try {
        json = JSON.parse(await fs.promises.readFile(jsonPath))
      } catch (e) {
        // not plugin folder, do nothing
        return null
      }
      try {
        json.id = id
        const addon = {
          id,
          title: json.title,
          folder: fullPath,
          json,
          remote: this.AUTO_DOWNLOADED[id] || null
        }
        if (!isNumber(addon.json.version)) {
          addon.error = 'Invalid add-on. Expecting number as version found string.'
        } else if (parseInt(addon.json.version) !== addon.json.version) {
          addon.error = `Invalid add-on. Expecting integer number as version, found ${addon.json.version}`
        } else if (!addon.json.minimum_jcz_version) {
          addon.error = 'Invalid add-on. Missing minimum_jcz_version.'
        } else if (compareVersions.compare(getAppVersion(), addon.json.minimum_jcz_version, '<')) {
          addon.error = `Add-on requires JCZ ${addon.json.minimum_jcz_version} or higher`
        } else if (addon.remote) {
          if (addon.json.version !== addon.remote.version) {
            const currentVersion = addon.json.version
            const requiredVersion = addon.remote.version
            if (currentVersion < requiredVersion) {
              console.log(`Artwork ${id} is outdated (current ${currentVersion}, reqired ${requiredVersion})`)
              addon.outdated = true
            }
          }
        }

        return addon
      } catch (e) {
        // unexpected error
        console.error(e)
      }
    }
    return null
  }

  async _readArtwork (id, fullPath) {
    const stats = await fs.promises.stat(fullPath)
    if (stats.isDirectory()) {
      const jsonPath = path.join(fullPath, 'artwork.json')
      let json
      try {
        json = JSON.parse(await fs.promises.readFile(jsonPath))
      } catch (e) {
        // not plugin folder, do nothing
        return null
      }
      try {
        json.id = id
        if (json.icon) {
          json.icon = 'file://' + path.join(fullPath, json.icon)
        }
        const artwork = {
          id,
          folder: fullPath,
          json
        }
        return artwork
      } catch (e) {
        // unexpected error
        console.error(e)
      }
    }
    return null
  }
}

export default (ctx, inject) => {
  let instance = null
  const prop = {
    get () {
      if (instance === null) {
        instance = new Addons(ctx)
      }
      return instance
    }
  }

  Object.defineProperty(Vue.prototype, '$addons', prop)
  Object.defineProperty(ctx, '$addons', prop)
}
