// import ConfigurableItem from './ConfigurableItem'

export class TileSet {
  constructor (id, title, options = {}) {
    this.id = id
    this.title = title
    this.max = options.max || null
    this.note = options.note || null
    this.expansion = null
  }
}

TileSet.configType = Number

export class Expansion {
  constructor (name, title, sets = null, options = {}) {
    this.name = name
    this.title = title
    if (sets === null) {
      this.sets = [new TileSet(name.toLowerCase().replace(/_/g, '-'), title)]
    } else {
      this.sets = sets
    }
    this.sets.forEach(s => { s.expansion = this })
    this.mergeSets = options.mergeSets || false
    this.symbol = options.symbol || false
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

export const INNS_AND_CATHEDRALS = Expansion.INNS_AND_CATHEDRALS = new Expansion('INNS_AND_CATHEDRALS', 'Inns & Cathedrals')
export const TRADERS_AND_BUILDERS = Expansion.TRADERS_AND_BUILDERS = new Expansion('TRADERS_AND_BUILDERS', 'Traders & Builders')
export const PRINCESS_AND_DRAGON = Expansion.PRINCESS_AND_DRAGON = new Expansion('PRINCESS_AND_DRAGON', 'The Princess & The Dragon')
export const TOWER = Expansion.TOWER = new Expansion('TOWER', 'The Tower')
export const ABBEY_AND_MAYOR = Expansion.ABBEY_AND_MAYOR = new Expansion('ABBEY_AND_MAYOR', 'Abbey & Mayor')
export const BRIDGES_CASTLES_AND_BAZAARS = Expansion.BRIDGES_CASTLES_AND_BAZAARS = new Expansion('BRIDGES_CASTLES_AND_BAZAARS', 'Bridges, Castles and Bazaars')
export const HILLS_AND_SHEEP = Expansion.HILLS_AND_SHEEP = new Expansion('HILLS_AND_SHEEP', 'Hills & Sheep')

export const KING_AND_ROBBER = Expansion.KING_AND_ROBBER = new Expansion('KING_AND_ROBBER', 'King and Robber')
export const RIVER = Expansion.RIVER = new Expansion('RIVER', 'The River', [
  new TileSet('river/1', 'The River I'),
  new TileSet('river/2', 'The River II')
])
export const SIEGE = Expansion.SIEGE = new Expansion('SIEGE', 'Siege', [
  new TileSet('siege/cathars', 'The Cathars / Siege', { note: 'The Cathars (2004), reprinted as Siege (2008)' }),
  new TileSet('siege/besiegers', 'The Besiegers', { note: '(2013)' })
])

export const COUNT = Expansion.COUNT = new Expansion('COUNT', 'The Count of Carcassonne', [
  new TileSet('count', 'The Count of Carcassonne', { max: 1 })
])
export const GQ11 = Expansion.GQ11 = new Expansion('GQ11', 'The Mini Expansion (GQ11)')
export const CULT = Expansion.CULT = new Expansion('CULT', 'The Cult', [
  new TileSet('cult/6', 'Cult Places', { note: '6 tiles (HiG)' }),
  new TileSet('cult/5', 'Heretics and Shrines', { note: '5 tiles (RGG)' })
])
export const TUNNEL = Expansion.TUNNEL = new Expansion('TUNNEL', 'The Tunnel')
export const CORN_CIRCLES = Expansion.CORN_CIRCLES = new Expansion('CORN_CIRCLES', 'Corn Circles', [
  new TileSet('corn-circles/1', 'Corn Circles I'),
  new TileSet('corn-circles/2', 'Corn Circle II', { note: 'mini #7' })
])

export const FESTIVAL = Expansion.FESTIVAL = new Expansion('FESTIVAL', 'The Festival')
export const WIND_ROSES = Expansion.WIND_ROSES = new Expansion('WIND_ROSES', 'The Wind Roses')
export const MONASTERIES = Expansion.MONASTERIES = new Expansion('MONASTERIES', 'Monasteries')

export const FLIER = Expansion.FLIER = new Expansion('FLIER', 'The Flying Machines')
export const FERRIES = Expansion.FERRIES = new Expansion('FERRIES', 'The Ferries')
export const GOLDMINES = Expansion.GOLDMINES = new Expansion('GOLDMINES', 'The Goldmines')
export const MAGE_AND_WITCH = Expansion.MAGE_AND_WITCH = new Expansion('MAGE_AND_WITCH', 'Mage & Witch')

export const RUSSIAN_PROMOS = Expansion.RUSSIAN_PROMOS = new Expansion('RUSSIAN_PROMOS', 'Russian Promos', [
  new TileSet('russian-promos/2013', 'Russian Promos 2013'),
  new TileSet('russian-promos/2016', 'Russian Promos 2016')
], { mergeSets: true })
export const LABYRINTH = Expansion.LABYRINTH = new Expansion('LABYRINTH', 'The Labyrinth')
export const DARMSTADT = Expansion.DARMSTADT = new Expansion('DARMSTADT', 'Darmstadt')
export const SPIEL_DOCH = Expansion.SPIEL_DOCH = new Expansion('SPIEL_DOCH', 'Spiel Doch')
