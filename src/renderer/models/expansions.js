
export class Release {
  constructor (title, sets, options = {}) {
    this.title = title
    this.sets = sets
    this.max = options.max || null
    this.note = options.note || null
    this.expansion = null
  }
}

Release.configType = Number

export class Expansion {
  constructor (name, title, options = {}, releases = null) {
    this.name = name
    this.title = title
    if (releases === null) {
      this.releases = [new Release(title, [name.toLowerCase().replace(/_/g, '-')])]
    } else {
      this.releases = releases
    }
    this.releases.forEach(r => { r.expansion = this })
    this.enforces = options.enforces || []
    this.implies = options.implies || []
  }

  static register (expansion) {
    expansion.fan = true
    Expansion[expansion.name] = expansion
    delete Expansion.__all
  }

  static unregisterAll (expansion) {
    Expansion.all().filter(exp => exp.fan).forEach(exp => delete Expansion[exp.name])
    delete Expansion.__all
  }

  static all () {
    if (Expansion.__all === undefined) {
      Expansion.__all = Object.values(Expansion).filter(prop => prop instanceof Expansion)
    }
    return Expansion.__all
  }
}

// export const BASIC = Expansion.BASIC = new Expansion('BASIC', 'Base game')
export const BASIC = Expansion.BASIC = new Expansion('BASIC', 'Base game')
export const WINTER = Expansion.WINTER = new Expansion('WINTER', 'Winter')

export const INNS_AND_CATHEDRALS = Expansion.INNS_AND_CATHEDRALS = new Expansion('INNS_AND_CATHEDRALS', 'Inns & Cathedrals', {
  implies: ['big-follower', 'cathedral', 'inn']
})
export const TRADERS_AND_BUILDERS = Expansion.TRADERS_AND_BUILDERS = new Expansion('TRADERS_AND_BUILDERS', 'Traders & Builders', {
  implies: ['builder', 'pig', 'traders', 'pig-herd']
})
export const PRINCESS_AND_DRAGON = Expansion.PRINCESS_AND_DRAGON = new Expansion('PRINCESS_AND_DRAGON', 'The Princess & The Dragon', {
  implies: ['dragon', 'fairy', 'princess']
})
export const TOWER = Expansion.TOWER = new Expansion('TOWER', 'The Tower', {
  implies: ['tower']
})
export const ABBEY_AND_MAYOR = Expansion.ABBEY_AND_MAYOR = new Expansion('ABBEY_AND_MAYOR', 'Abbey & Mayor', {
  implies: ['abbey', 'barn', 'mayor', 'wagon']
})
export const BRIDGES_CASTLES_AND_BAZAARS = Expansion.BRIDGES_CASTLES_AND_BAZAARS = new Expansion('BRIDGES_CASTLES_AND_BAZAARS', 'Bridges, Castles and Bazaars', {
  implies: ['bridge', 'castle', 'bazaar']
})
export const HILLS_AND_SHEEP = Expansion.HILLS_AND_SHEEP = new Expansion('HILLS_AND_SHEEP', 'Hills & Sheep', {
  implies: ['shepherd', 'hill', 'vineyard']
})

export const KING_AND_ROBBER = Expansion.KING_AND_ROBBER = new Expansion('KING_AND_ROBBER', 'King and Robber', { implies: ['king', 'robber'] })
export const RIVER = Expansion.RIVER = new Expansion('RIVER', 'The River', { enforces: ['river'] }, [
  new Release('The River I', ['river/1']),
  new Release('The River II', ['river/2'])
])
export const SIEGE = Expansion.SIEGE = new Expansion('SIEGE', 'Siege', { enforces: ['siege'], implies: ['escape'] }, [
  new Release('The Cathars / Siege', ['siege/cathars'], { note: 'The Cathars (2004), reprinted as Siege (2008)' }),
  new Release('The Besiegers', ['siege/besiegers'], { note: '(2013)' })
])

export const COUNT = Expansion.COUNT = new Expansion('COUNT', 'The Count of Carcassonne', { implies: ['count'] }, [
  new Release('The Count of Carcassonne', ['count'], { max: 1 })
])
export const GQ11 = Expansion.GQ11 = new Expansion('GQ11', 'The Mini Expansion (GQ11)', {}, [
  new Release('The Mini Expansion (GQ11)', ['gq11', 'gq11/river'])
])
export const CULT = Expansion.CULT = new Expansion('CULT', 'The Cult', { implies: ['shrine'] }, [
  new Release('Cult Places', ['cult/6'], { note: '6 tiles (HiG)' }),
  new Release('Heretics and Shrines', ['cult/5'], { note: '5 tiles (RGG)' })
])
export const TUNNEL = Expansion.TUNNEL = new Expansion('TUNNEL', 'The Tunnel', { implies: ['tunnel'] })
export const CORN_CIRCLES = Expansion.CORN_CIRCLES = new Expansion('CORN_CIRCLES', 'Corn Circles', { enforces: ['corn-circle'] }, [
  new Release('Corn Circles I', ['corn-circles/1']),
  new Release('Corn Circle II', ['corn-circles/2'], { note: 'mini #7' })
])

export const FESTIVAL = Expansion.FESTIVAL = new Expansion('FESTIVAL', 'The Festival', { implies: ['festival'] })
export const WIND_ROSES = Expansion.WIND_ROSES = new Expansion('WIND_ROSES', 'The Wind Roses', { enforces: ['wind-rose'] })
export const MONASTERIES = Expansion.MONASTERIES = new Expansion('MONASTERIES', 'Monasteries', { enforces: ['monastery'] })

export const FLIER = Expansion.FLIER = new Expansion('FLIER', 'The Flying Machines', { enforces: ['flier'] })
export const FERRIES = Expansion.FERRIES = new Expansion('FERRIES', 'The Ferries', {
  implies: ['ferries']
})
export const GOLDMINES = Expansion.GOLDMINES = new Expansion('GOLDMINES', 'The Goldmines', { implies: ['gold'] })
export const MAGE_AND_WITCH = Expansion.MAGE_AND_WITCH = new Expansion('MAGE_AND_WITCH', 'Mage & Witch', {
  implies: ['mage', 'witch']
})

export const RUSSIAN_PROMOS = Expansion.RUSSIAN_PROMOS = new Expansion('RUSSIAN_PROMOS', 'Russian Promos', { enforces: ['yaga', 'russian-trap'] }, [
  new Release('Russian Promos', ['russian-promos/2013', 'russian-promos/2016'])
])
export const LABYRINTH = Expansion.LABYRINTH = new Expansion('LABYRINTH', 'The Labyrinth', { enforces: ['labyrinth'] })
export const DARMSTADT = Expansion.DARMSTADT = new Expansion('DARMSTADT', 'Darmstadt', { enforces: ['church'] })
export const SPIEL_DOCH = Expansion.SPIEL_DOCH = new Expansion('SPIEL_DOCH', 'Spiel Doch')
