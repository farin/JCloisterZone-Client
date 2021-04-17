import mapKeys from 'lodash/mapKeys'

export class GameElement {
  /*
    tile sets:
      off - feature is disabled (missing required tiles)
      true / false - boolean feature
      int - can be added multiple tiles (meeples/GameElement sets)
  */

  constructor (id, title, tileSetsDeps) {
    this.id = id
    this.title = title
    this.tileSetsDeps = tileSetsDeps

    const sampleValue = Object.values(tileSetsDeps).filter(v => v !== 'off')[0]
    this.configType = sampleValue === true || sampleValue === false ? Boolean : Number
  }

  static all () {
    if (GameElement.__all === undefined) {
      GameElement.__all = Object.values(GameElement).filter(prop => prop instanceof GameElement)
    }
    return GameElement.__all
  }

  isEnabled (enabledSets, enabledElements) {
    if (this.id === 'garden') {
      return !!enabledElements.abbot
    }
    return this.getDefaultConfig(enabledSets) !== 'off'
  }

  getDefaultConfig (enabledSets) {
    let quantity = this.tileSetsDeps['*']

    function qmax (a, b) {
      if (a === 'off' || a === false) return b
      if (b === 'off' || b === false) return a
      if (a === true || b === true) return true
      return Math.max(a, b)
    }

    Object.entries(this.tileSetsDeps).forEach(([pattern, compQuantity]) => {
      if (pattern === '*') return
      if (pattern.endsWith('/*')) {
        const exp = pattern.split('/')[0]
        Object.entries(enabledSets).forEach(([set, setQuantity]) => {
          if (setQuantity && exp === set.split('/')[0]) {
            quantity = qmax(quantity, compQuantity)
          }
        })
      } else if (enabledSets[pattern]) {
        quantity = qmax(quantity, compQuantity)
      }
    })
    return quantity
  }
}

export function isConfigValueEnabled (config) {
  return config !== 'off' && config !== false && config !== 0
}

export function getDefaultElements (sets) {
  const q = {}

  sets = mapKeys(sets, (val, key) => key.split(':')[0]) // strip C1 / C2 suffix
  GameElement.all().forEach(c => {
    const conf = c.getDefaultConfig(sets)
    if (isConfigValueEnabled(conf)) {
      q[c.id] = conf
    }
  })
  return q
}

// Meeples
export const SMALL_FOLLOWER = GameElement.SMALL_FOLLOWER = new GameElement('small-follower', 'Small Follower', {
  '*': 7
})
export const ABBOT = GameElement.ABBOT = new GameElement('abbot', 'Abbot', {
  '*': 0
})
export const PHANTOM = GameElement.PHANTOM = new GameElement('phantom', 'Phantom', {
  '*': 0
})
export const BIG_FOLLOWER = GameElement.BIG_FOLLOWER = new GameElement('big-follower', 'Big Follower', {
  '*': 0,
  'inns-and-cathedrals': 1
})
export const BUILDER = GameElement.BUILDER = new GameElement('builder', 'Builder', {
  '*': 0,
  'traders-and-builders': 1
})
export const PIG = GameElement.PIG = new GameElement('pig', 'Pig', {
  '*': 0,
  'traders-and-builders': 1
})
export const BARN = GameElement.BARN = new GameElement('barn', 'Barn', {
  '*': 0,
  'abbey-and-mayor': 1
})
export const WAGON = GameElement.WAGON = new GameElement('wagon', 'Wagon', {
  '*': 0,
  'abbey-and-mayor': 1
})
export const MAYOR = GameElement.MAYOR = new GameElement('mayor', 'Mayor', {
  '*': 0,
  'abbey-and-mayor': 1
})
export const SHEPHERD = GameElement.SHEPHERD = new GameElement('shepherd', 'Shepherd', {
  '*': 0,
  'hills-and-sheep': 1
})

// Neutral
export const DRAGON = GameElement.DRAGON = new GameElement('dragon', 'Dragon', {
  '*': 'off',
  'princess-and-dragon': 1
})
export const FAIRY = GameElement.FAIRY = new GameElement('fairy', 'Fairy', {
  '*': 0,
  'princess-and-dragon': 1
})
export const COUNT = GameElement.COUNT = new GameElement('count', 'Count', {
  '*': 'off',
  'count': 1
})
export const MAGE = GameElement.MAGE = new GameElement('mage', 'Mage', {
  '*': 'off',
  'mage-and-witch': 1
})
export const WITCH = GameElement.WITCH = new GameElement('witch', 'Witch', {
  '*': 'off',
  'mage-and-witch': 1
})

// Player Tokens
export const TOWER = GameElement.TOWER = new GameElement('tower', 'Tower pieces', {
  '*': 'off',
  'tower': 1
})
export const ABBEY = GameElement.ABBEY = new GameElement('abbey', 'Abbey tile', {
  '*': 0,
  'abbey-and-mayor': 1
})
export const BRIDGE = GameElement.BRIDGE = new GameElement('bridge', 'Bridges', {
  '*': 0,
  'bridges-castles-and-bazaars': 1
})
export const CASTLE = GameElement.CASTLE = new GameElement('castle', 'Castles', {
  '*': 0,
  'bridges-castles-and-bazaars': 1
})
export const TUNNEL = GameElement.TUNNEL = new GameElement('tunnel', 'Tunnel tokens', {
  '*': 'off',
  'tunnel': 1
})
export const FERRY = GameElement.FERRY = new GameElement('ferry', 'Ferries', {
  '*': 'off',
  'ferries': 1
})
export const LITTLE_BUILDINGS = GameElement.LITTLE_BUILDINGS = new GameElement('little-buildings', 'Little Buildings', {
  '*': 0
})

// Rewards
export const TRADERS = GameElement.TRADERS = new GameElement('traders', 'Trade goods', {
  '*': 'off',
  'traders-and-builders': true
})
export const KING = GameElement.KING = new GameElement('king', 'King', {
  '*': false,
  'king-and-robber': true
})
export const ROBBER = GameElement.ROBBER = new GameElement('robber', 'Robber', {
  '*': false,
  'king-and-robber': true
})
export const GOLD = GameElement.GOLD = new GameElement('gold', 'Gold pieces', {
  '*': 'off',
  'goldmines': 1
})

// Game mechanics

export const FARMERS = GameElement.FARMERS = new GameElement('farmers', 'Farmers', {
  '*': true
})
export const GARDEN = GameElement.GARDEN = new GameElement('garden', 'Gardens', {
  '*': false // switched by abbot change
})
export const CATHEDRAL = GameElement.CATHEDRAL = new GameElement('cathedral', 'Cathedrals', {
  '*': 'off',
  'inns-and-cathedrals': true
})
export const INN = GameElement.INN = new GameElement('inn', 'Inns', {
  '*': 'off',
  'river/2': false,
  'bridges-castles-and-bazaars': false,
  'inns-and-cathedrals': true
})
export const PRINCESS = GameElement.PRINCESS = new GameElement('princess', 'Princess', {
  '*': 'off',
  'princess-and-dragon': true
})
export const PORTAL = GameElement.PORTAL = new GameElement('portal', 'Magic portals', {
  '*': 'off',
  'princess-and-dragon': true
})
export const PIG_HERD = GameElement.PIG_HERD = new GameElement('pig-herd', 'Pig Herds', {
  '*': 'off',
  'gq11': false,
  'river/2': false,
  'traders-and-builders': true
})
export const BAZAAR = GameElement.BAZAAR = new GameElement('bazaar', 'Bazaars', {
  '*': 'off',
  'bridges-castles-and-bazaars': true
})
export const HILL = GameElement.HILL = new GameElement('hill', 'Hills', {
  '*': 'off',
  'hills-and-sheep': true
})
export const VINEYARD = GameElement.VINEYARD = new GameElement('vineyard', 'Vineyards', {
  '*': 'off',
  'river/3': false,
  'hills-and-sheep': true
})
export const SHRINE = GameElement.SHRINE = new GameElement('shrine', 'Cloister/Shrine challenges', {
  '*': 'off',
  'cult/*': true
})
export const FESTIVAL = GameElement.FESTIVAL = new GameElement('festival', 'Festival', {
  '*': 'off',
  'festival': true
})
export const ESCAPE = GameElement.ESCAPE = new GameElement('escape', 'Escaping a besieged city', {
  '*': 'off',
  'siege/*': true
})
export const WELL = GameElement.WELL = new GameElement('well', 'Wells', {
  '*': 'off',
  'abbey-and-mayor': false
})
