export class GameElement {
  /*
    tile sets:
      off - feature is disabled (missing required tiles)
      true / false - boolean feature
      int - can be added multiple tiles (meeples/GameElement sets)
  */

  constructor (id, title, configType, options = {}) {
    this.id = id
    this.title = title
    this.configType = configType
    Object.assign(this, options)
    GameElement.__all[id] = this
  }

  static all () {
    return Object.values(GameElement.__all)
  }

  static get (id) {
    return GameElement.__all[id]
  }
}

GameElement.__all = {}

export function isConfigValueEnabled (config) {
  return config !== 'off' && config !== false && config !== 0
}

// Meeples
export const SMALL_FOLLOWER = GameElement.SMALL_FOLLOWER = new GameElement('small-follower', 'Small Follower', Number, { default: 7 })
export const ABBOT = GameElement.ABBOT = new GameElement('abbot', 'Abbot', Number, { default: 0 })
export const PHANTOM = GameElement.PHANTOM = new GameElement('phantom', 'Phantom', Number, { default: 0 })
export const BIG_FOLLOWER = GameElement.BIG_FOLLOWER = new GameElement('big-follower', 'Big Follower', Number, { default: 0 })
export const BUILDER = GameElement.BUILDER = new GameElement('builder', 'Builder', Number, { default: 0 })
export const PIG = GameElement.PIG = new GameElement('pig', 'Pig', Number, { default: 0 })
export const BARN = GameElement.BARN = new GameElement('barn', 'Barn', Number, { default: 0 })
export const WAGON = GameElement.WAGON = new GameElement('wagon', 'Wagon', Number, { default: 0 })
export const MAYOR = GameElement.MAYOR = new GameElement('mayor', 'Mayor', Number, { default: 0 })
export const SHEPHERD = GameElement.SHEPHERD = new GameElement('shepherd', 'Shepherd', Number, { default: 0 })

// Neutral
export const DRAGON = GameElement.DRAGON = new GameElement('dragon', 'Dragon', Number, { selector: 'dragon' })
export const FAIRY = GameElement.FAIRY = new GameElement('fairy', 'Fairy', Number, { default: 0 })
export const COUNT = GameElement.COUNT = new GameElement('count', 'Count', Number, { selector: 'quarter' })
export const MAGE = GameElement.MAGE = new GameElement('mage', 'Mage', Number, { selector: 'mage' })
export const WITCH = GameElement.WITCH = new GameElement('witch', 'Witch', Number, { selector: 'mage' }) // trigger on tile is simply called mage

// Player Tokens
export const TOWER = GameElement.TOWER = new GameElement('tower', 'Tower pieces', Number, { selector: 'tower' })
export const ABBEY = GameElement.ABBEY = new GameElement('abbey', 'Abbey tile', Number, { default: 0 })
export const BRIDGE = GameElement.BRIDGE = new GameElement('bridge', 'Bridges', Number, { default: 0 })
export const CASTLE = GameElement.CASTLE = new GameElement('castle', 'Castles', Number, { default: 0 })
export const TUNNEL = GameElement.TUNNEL = new GameElement('tunnel', 'Tunnel tokens', Number)
export const FERRY = GameElement.FERRY = new GameElement('ferry', 'Ferries', Number, { selector: 'ferry' })
export const LITTLE_BUILDINGS = GameElement.LITTLE_BUILDINGS = new GameElement('little-buildings', 'Little Buildings', Number, { default: 0 })

// Rewards
export const TRADERS = GameElement.TRADERS = new GameElement('traders', 'Trade goods', Boolean, { selector: 'city[resource]' })
export const KING = GameElement.KING = new GameElement('king', 'King', Boolean, { default: false })
export const ROBBER = GameElement.ROBBER = new GameElement('robber', 'Robber', Boolean, { default: false })
export const GOLD = GameElement.GOLD = new GameElement('gold', 'Gold pieces', Boolean, { selector: 'goldmine' })

// Game mechanics

export const FARMERS = GameElement.FARMERS = new GameElement('farmers', 'Farmers', Boolean, { default: true })
export const GARDEN = GameElement.GARDEN = new GameElement('garden', 'Gardens', Boolean, {
  default: false // switched by abbot change
})
export const CATHEDRAL = GameElement.CATHEDRAL = new GameElement('cathedral', 'Cathedrals', Boolean, {
  selector: 'city[cathedral]'
})
export const INN = GameElement.INN = new GameElement('inn', 'Inns', Boolean, {
  selector: 'road[inn]'
})
export const PRINCESS = GameElement.PRINCESS = new GameElement('princess', 'Princess', Boolean, {
  selector: 'city[princess]'
})
export const PORTAL = GameElement.PORTAL = new GameElement('portal', 'Magic portals', Boolean, {
  selector: 'portal'
})
export const PIG_HERD = GameElement.PIG_HERD = new GameElement('pig-herd', 'Pig Herds', Boolean, {
  selector: 'farm[pig]'
})
export const BAZAAR = GameElement.BAZAAR = new GameElement('bazaar', 'Bazaars', Boolean, {
  selector: 'bazaar'
})
export const HILL = GameElement.HILL = new GameElement('hill', 'Hills', Boolean, {
  selector: 'hill'
})
export const VINEYARD = GameElement.VINEYARD = new GameElement('vineyard', 'Vineyards', Boolean, {
  selector: 'vineyard'
})
export const SHRINE = GameElement.SHRINE = new GameElement('shrine', 'Cloister/Shrine challenges', Boolean, {
  selector: 'cloister[shrine]'
})
export const FESTIVAL = GameElement.FESTIVAL = new GameElement('festival', 'Festival', Boolean, {
  selector: 'festival'
})
export const SIEGE = GameElement.SIEGE = new GameElement('siege', 'Besieged cities', Boolean, {
  selector: 'city[besieged]'
})
export const ESCAPE = GameElement.ESCAPE = new GameElement('escape', 'Escaping a besieged city', Boolean, {
  selector: 'city[besieged]'
})
