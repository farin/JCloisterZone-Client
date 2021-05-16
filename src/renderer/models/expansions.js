
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
  constructor (name, title, releases = null, options = {}) {
    this.name = name
    this.title = title
    if (releases === null) {
      this.releases = [new Release(title, [name.toLowerCase().replace(/_/g, '-')])]
    } else {
      this.releases = releases
    }
    this.releases.forEach(r => { r.expansion = this })
    this.enforce = options.enforce || []
    this.fan = options.fan || false
  }

  static all () {
    return Object.values(Expansion).filter(prop => prop instanceof Expansion)
  }
}

// export const BASIC = Expansion.BASIC = new Expansion('BASIC', 'Base game')
export const BASIC = Expansion.BASIC = new Expansion('BASIC', 'Base game')
export const WINTER = Expansion.WINTER = new Expansion('WINTER', 'Winter')

export const INNS_AND_CATHEDRALS = Expansion.INNS_AND_CATHEDRALS = new Expansion('INNS_AND_CATHEDRALS', 'Inns & Cathedrals')
export const TRADERS_AND_BUILDERS = Expansion.TRADERS_AND_BUILDERS = new Expansion('TRADERS_AND_BUILDERS', 'Traders & Builders')
export const PRINCESS_AND_DRAGON = Expansion.PRINCESS_AND_DRAGON = new Expansion('PRINCESS_AND_DRAGON', 'The Princess & The Dragon')
export const TOWER = Expansion.TOWER = new Expansion('TOWER', 'The Tower')
export const ABBEY_AND_MAYOR = Expansion.ABBEY_AND_MAYOR = new Expansion('ABBEY_AND_MAYOR', 'Abbey & Mayor')
export const BRIDGES_CASTLES_AND_BAZAARS = Expansion.BRIDGES_CASTLES_AND_BAZAARS = new Expansion('BRIDGES_CASTLES_AND_BAZAARS', 'Bridges, Castles and Bazaars')
export const HILLS_AND_SHEEP = Expansion.HILLS_AND_SHEEP = new Expansion('HILLS_AND_SHEEP', 'Hills & Sheep')

export const KING_AND_ROBBER = Expansion.KING_AND_ROBBER = new Expansion('KING_AND_ROBBER', 'King and Robber')
export const RIVER = Expansion.RIVER = new Expansion('RIVER', 'The River', [
  new Release('The River I', ['river/1']),
  new Release('The River II', ['river/2'])
], { enforce: ['river'] })
export const SIEGE = Expansion.SIEGE = new Expansion('SIEGE', 'Siege', [
  new Release('The Cathars / Siege', ['siege/cathars'], { note: 'The Cathars (2004), reprinted as Siege (2008)' }),
  new Release('The Besiegers', ['siege/besiegers'], { note: '(2013)' })
], { enforce: ['siege'] })

export const COUNT = Expansion.COUNT = new Expansion('COUNT', 'The Count of Carcassonne', [
  new Release('The Count of Carcassonne', ['count'], { max: 1 })
])
export const GQ11 = Expansion.GQ11 = new Expansion('GQ11', 'The Mini Expansion (GQ11)', [
  new Release('The Mini Expansion (GQ11)', ['gq11', 'gq11/river'])
])
export const CULT = Expansion.CULT = new Expansion('CULT', 'The Cult', [
  new Release('Cult Places', ['cult/6'], { note: '6 tiles (HiG)' }),
  new Release('Heretics and Shrines', ['cult/5'], { note: '5 tiles (RGG)' })
])
export const TUNNEL = Expansion.TUNNEL = new Expansion('TUNNEL', 'The Tunnel')
export const CORN_CIRCLES = Expansion.CORN_CIRCLES = new Expansion('CORN_CIRCLES', 'Corn Circles', [
  new Release('Corn Circles I', ['corn-circles/1']),
  new Release('Corn Circle II', ['corn-circles/2'], { note: 'mini #7' })
], { enforce: ['corn-circle'] })

export const FESTIVAL = Expansion.FESTIVAL = new Expansion('FESTIVAL', 'The Festival')
export const WIND_ROSES = Expansion.WIND_ROSES = new Expansion('WIND_ROSES', 'The Wind Roses', null, { enforce: ['wind-rose'] })
export const MONASTERIES = Expansion.MONASTERIES = new Expansion('MONASTERIES', 'Monasteries', null, { enforce: ['monastery'] })

export const FLIER = Expansion.FLIER = new Expansion('FLIER', 'The Flying Machines', null, { enforce: ['flier'] })
export const FERRIES = Expansion.FERRIES = new Expansion('FERRIES', 'The Ferries')
export const GOLDMINES = Expansion.GOLDMINES = new Expansion('GOLDMINES', 'The Goldmines')
export const MAGE_AND_WITCH = Expansion.MAGE_AND_WITCH = new Expansion('MAGE_AND_WITCH', 'Mage & Witch')

export const RUSSIAN_PROMOS = Expansion.RUSSIAN_PROMOS = new Expansion('RUSSIAN_PROMOS', 'Russian Promos', [
  new Release('Russian Promos', ['russian-promos/2013', 'russian-promos/2016'])
], { enforce: ['yaga', 'russian-trap'] })
export const LABYRINTH = Expansion.LABYRINTH = new Expansion('LABYRINTH', 'The Labyrinth', null, { enforce: ['labyrinth'] })
export const DARMSTADT = Expansion.DARMSTADT = new Expansion('DARMSTADT', 'Darmstadt', null, { enforce: ['church'] })
export const SPIEL_DOCH = Expansion.SPIEL_DOCH = new Expansion('SPIEL_DOCH', 'Spiel Doch')
