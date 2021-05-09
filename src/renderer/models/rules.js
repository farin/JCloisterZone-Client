export class Rule {
  constructor (id, title, deps, values, options = {}) {
    this.id = id
    this.title = title
    this.deps = deps
    this.values = values
    this.link = options.link || null
    if (options.default !== undefined) {
      this.default = options.default
    } else {
      this.default = values === Boolean ? false : values[0].value
    }
    this.options = options
  }

  static all () {
    if (Rule.__all === undefined) {
      Rule.__all = Object.values(Rule).filter(prop => prop instanceof Rule)
    }
    return Rule.__all
  }
}

export function getDefaultRules () {
  const defaults = {}
  Rule.all().forEach(r => {
    defaults[r.id] = r.default
  })
  return defaults
}

export const PRINCESS_ACTION = Rule.PRINCESS_ACTION = new Rule('princess-action',
  'The Princess {} remove knight from a city.',
  { elements: ['princess'] },
  [
    { value: 'may', text: 'may', flags: ['HiG'] },
    { value: 'must', text: 'must', flags: ['RGG', 'ZMG'] }
  ],
  { style: 'short' }
)

export const FAIRY_PLACEMENT = Rule.FAIRY_PLACEMENT = new Rule('fairy-placement',
  'The Fairy is deployed {}.',
  { elements: ['fairy'] },
  [
    { value: 'next-follower', text: 'next to a follower', flags: ['HiG'] },
    { value: 'on-tile', text: 'on a tile', flags: ['RGG', 'ZMG'] }
  ]
)

export const DRAGON_MOVEMENT = Rule.DRAGON_MOVEMENT = new Rule('dragon-move',
  'Dragon movement occurs {} scoring.',
  { elements: ['dragon'] },
  [
    { value: 'before-scoring', text: 'before', flags: ['HiG', 'ZMG'] },
    { value: 'after-scoring', text: 'after', flags: ['RGG'] }
  ],
  { style: 'short' }
)

export const BARN_PLACEMENT = Rule.BARN_PLACEMENT = new Rule('barn-placement',
  'Barn {} be placed on a\u00A0field already occupied by another barn.',
  { elements: ['barn'] },
  [
    { value: 'not-occupied', text: "can't " },
    { value: 'occupied', text: 'can' }
  ],
  { style: 'short' }
)

export const WAGON_MOVE = Rule.WAGON_MOVE = new Rule('wagon-move',
  'After scored, wagon can me moved to adjacent unoccupied, incomplete feature. Adjacent means: {}',
  { elements: ['wagon'] },
  [
    { value: 'C1', text: 'connected (road crossing or road heading to a city/cloister) (1st ed.)' },
    { value: 'C2', text: 'feature on the same or an adjacent tile (2nd ed.)' }
  ],
  { default: 'C2', style: 'xlong' }
)

export const BAZAAR_NO_AUCTION = Rule.BAZAAR_NO_AUCTION = new Rule('bazaar-no-auction',
  'No bazaar bidding. Each player just chooses one tile.',
  { elements: ['bazaar'] },
  Boolean,
  {
    link: 'http://wikicarpedia.com/index.php/Bridges,_Castles_and_Bazaars#Bazaar'
  }
)

export const HILL_TIEBREAKER = Rule.HILL_TIEBREAKER = new Rule('hill-tiebreaker',
  'Tiebreaker method: {} on hills.',
  { elements: ['bazaar'] },
  [
    { value: 'at-least-one-follower', text: 'at least one follower' },
    { value: 'number-of-followers', text: 'number of followers' }
  ],
  {
    link: 'http://wikicarpedia.com/index.php/Hills_%26_Sheep_(1st_edition)#cite_note-9'
  }
)

export const ESCAPE_VARIANT = Rule.ESCAPE_VARIANT = new Rule('espace-variant',
  'Cloister must be placed adjacent to {} of a\u00A0;besieged city to espace.',
  { elements: ['escape'] },
  [
    { value: 'any-tile', text: 'any tile', flags: ['RGG'] },
    { value: 'siege-tile', text: 'siege tile' }
  ],
  {
    link: 'http://wikicarpedia.com/index.php/Besiegers_Cathars_Siege_(1st_edition)#cite_note-5'
  }
)

export const GQ11_PIG_HERD = Rule.GQ11_PIG_HERD = new Rule('gq11-pig-herd',
  'Field tile from Game Quarterly 11 expansion {}.',
  { tiles: ['gq11'] },
  [
    { value: 'pig', text: 'contains pig herd', flags: ['house'] },
    { value: 'nothing', text: 'is just empty field' }
  ],
  {
    link: 'http://wikicarpedia.com/index.php/Games_Quarterly_11_(1st_edition)#cite_note-5'
  }
)

export const TUNNELIZE_OTHER_EXPANSIONS = Rule.TUNNELIZE_OTHER_EXPANSIONS = new Rule('tunnelize-other-expansions',
  'Apply tunnel rule on tiles from other expansions with depicted tunnels.',
  { elements: ['tunnel'] },
  Boolean,
  {
    default: true,
    link: 'http://wikicarpedia.com/index.php/The_Tunnel_(1st_edition)#Other_Expansions'
  }
)

export const MORE_TUNNEL_TOKENS = Rule.MORE_TUNNEL_TOKENS = new Rule('more-tunnel-tokens',
  'Assign {} token sets to each player in game of two/three.',
  { elements: ['tunnel'] },
  [
    { value: '3/2', text: '3/2' },
    { value: '2/1', text: '2/1' },
    { value: '1/1', text: '1/1' }
  ],
  {
    link: 'http://wikicarpedia.com/index.php/The_Tunnel_(1st_edition)#Preparation',
    style: 'short'
  }
)

export const FESTIVAL_RETURN = Rule.FESTIVAL_RETURN = new Rule('festival-return',
  'Player may return one of one’s own {}.',
  { elements: ['festival'] },
  [
    { value: 'meeple', text: 'meeples' },
    { value: 'follower', text: 'followers', flags: 'RGG' }
  ],
  {
    link: 'http://wikicarpedia.com/index.php/The_Festival_(1st_edition)#cite_ref-6'
  }
)

export const KEEP_MONASTERIES = Rule.KEEP_MONASTERIES = new Rule('keep-monasteries',
  'Special monasteries {}.',
  { tiles: ['monasteries'] },
  [
    { value: 'replace', text: 'replace orignal monasteries' },
    { value: 'add', text: 'are just added' }
  ],
  {
    link: 'http://wikicarpedia.com/index.php/Monasteries#cite_note-1',
    style: 'long'
  }
)

export const LABYRINTH_VARIANT = Rule.LABYRINTH_VARIANT = new Rule('labyrinth-variant',
  'Play {} labyrinth variant',
  { tiles: ['labyrith'] },
  [
    { value: 'basic', text: 'basic' },
    { value: 'advanced', text: 'advanced' }
  ],
  {
    default: 'advanced',
    link: 'http://wikicarpedia.com/index.php/The_Labyrinths'
  },
  { style: 'short' }
)

export const COC_FINAL_SCORING = Rule.COC_FINAL_SCORING = new Rule('coc-final-scoring',
  'Moving meeples from the City of Carcassonne before final scoring {}.',
  { tiles: ['count'] },
  [
    { value: 'market-only', text: 'is allowed only from market district (C2)' },
    { value: 'any-district', text: 'is not limited (C1)' }
  ],
  { style: 'xlong' }
)

export const COUNT_MOVE = Rule.COUNT_MOVE = new Rule('count-move',
  'When meeple is deployed to the City of C. then the Count is moved {}.',
  { tiles: ['count'] },
  [
    { value: 'by-player', text: 'by player' },
    { value: 'clockwise', text: 'clockwise to the next district' },
    { value: 'follow-meeple', text: 'to whichever district as the meeple' }
  ],
  { style: 'long ' }
)

// Scoring

export const LITTLE_BUILDINGS_SCORING = Rule.LITTLE_BUILDINGS_SCORING = new Rule('little-buildings-scoring',
  'Assign {} points for tower/house/shed.',
  { elements: ['little-buildings'] },
  [
    { value: '1/1/1', text: '1/1/1' },
    { value: '3/2/1', text: '3/2/1' }
  ],
  {
    link: 'http://wikicarpedia.com/index.php/Little_Buildings_(1st_edition)#Variant',
    style: 'short'
  }
)

export const KING_AND_ROBBER_SCORING = Rule.KING_AND_ROBBER_SCORING = new Rule('king-and-robber-scoring',
  'Score {} at the end of the game.',
  { elements: ['king', 'robber'] },
  [
    { value: 'default', text: '1 point for every completed feature' },
    { value: '10/20', text: '10 points / each card' },
    { value: '15/40', text: '15/40 pts for having single/both cards' },
    { value: 'continuously', text: 'points continuously during play' }
  ],
  {
    link: 'http://wikicarpedia.com/index.php/Count,_King_and_Robber_(1st_edition)#House_Rules',
    style: 'xlong',
    hideTitleSuffixIfValueEquals: 'continuously'
  }
)

export const TINY_CITY_SCORING = Rule.TINY_CITY_SCORING = new Rule('tiny-city-scoring',
  'Tiny city is scored for {} points',
  null,
  [
    { value: '4', text: '4' },
    { value: '2', text: '2' }
  ],
  { style: 'short' }
)
