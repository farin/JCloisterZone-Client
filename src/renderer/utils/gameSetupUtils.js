export function getSelectedEdition (elements) {
  if (!elements) return null
  return elements.garden ? 2 : 1
}

export function getStartingTilesOptions (elements, sets) {
  const river = sets['river/1'] || sets['river/2'] || sets['river/3']
  const count = !!sets.count
  const windRoses = !!sets['wind-roses']

  const countTiles = [
    { tile: 'CO/1', x: -2, y: -1, rotation: 0 },
    { tile: 'CO/2', x: -1, y: -1, rotation: 0 },
    { tile: 'CO/3', x: 0, y: -1, rotation: 0 },
    { tile: 'CO/4', x: 1, y: -1, rotation: 0 },
    { tile: 'CO/5', x: -2, y: 0, rotation: 0 },
    { tile: 'CO/6', x: -1, y: 0, rotation: 0 },
    { tile: 'CO/7', x: 0, y: 0, rotation: 0 },
    { tile: 'CO/8', x: 1, y: 0, rotation: 0 },
    { tile: 'CO/9', x: -2, y: 1, rotation: 0 },
    { tile: 'CO/10', x: -1, y: 1, rotation: 0 },
    { tile: 'CO/11', x: 0, y: 1, rotation: 0 },
    { tile: 'CO/12', x: 1, y: 1, rotation: 0 }
  ]

  const options = [
    {
      id: 'standard',
      title: 'Standard',
      value: [{ tile: 'BA/RCr', x: 0, y: 0, rotation: 0 }],
      enabled: !river && !count && !windRoses,
      default: !river && !count && !windRoses && !sets['spiel-doch']
    }, {
      id: 'wind-roses',
      title: 'The Wind Roses',
      value: [{ tile: 'WR/CFR', x: 0, y: 0, rotation: 0 }],
      enabled: !river && !count && windRoses,
      default: !river && !count && windRoses
    }, {
      id: 'spiel-doch',
      title: 'Spiel Doch Promo',
      value: [
        { tile: 'SD/CC', x: 0, y: 0, rotation: 0 },
        { tile: getSelectedEdition(elements) === 1 ? 'SD/RRR' : 'SD/RRRG', x: 1, y: 0, rotation: 270 }
      ],
      enabled: !!sets['spiel-doch'] && !count && !river && !windRoses,
      default: !!sets['spiel-doch'] && !count && !river && !windRoses
    }, {
      id: 'spring',
      title: 'The River',
      value: [{ tile: 'RI/s', x: 0, y: 0, rotation: 0 }],
      enabled: river && !count && !windRoses,
      default: river && !count && !windRoses && !sets.gq11
    }, {
      id: 'spring-alt',
      title: 'GQ11 spring',
      value: [{ tile: 'GQ/RFI', x: 0, y: 0, rotation: 0 }],
      enabled: river && !count && !windRoses && sets.gq11,
      default: river && !count && !windRoses && sets.gq11
    }, {
      id: 'spring-with-wind-roses',
      title: 'The Wind Roses + The River',
      value: [
        { tile: 'WR/CFR', x: 0, y: 0, rotation: 0 },
        { tile: 'RI/s', x: 0, y: 1, rotation: 90 }
      ],
      enabled: river && !count && windRoses,
      default: river && !count && windRoses
    }, {
      id: 'count',
      title: 'The Count',
      value: countTiles,
      enabled: count && !river && !windRoses,
      default: count && !river && !windRoses
    }, {
      id: 'count-with-river',
      title: 'The Count + The River',
      value: [...countTiles, { tile: 'RI/s', x: 2, y: -1, rotation: 0 }],
      enabled: count && river && !windRoses,
      default: count && river && !windRoses
    }, {
      id: 'count-with-wind-roses',
      title: 'The Count + The Wind Roses',
      value: [...countTiles, { tile: 'WR/CFR', x: -1, y: -2, rotation: 0 }],
      enabled: count && !river && windRoses,
      default: count && !river && windRoses
    }, {
      id: 'count-with-wind-roses-and-river',
      title: 'The Count + The Wind Roses + The River',
      value: [
        ...countTiles,
        { tile: 'WR/CFR', x: -1, y: -2, rotation: 0 },
        { tile: 'RI/s', x: 2, y: -1, rotation: 0 }
      ],
      enabled: count && river && windRoses,
      default: count && river && windRoses
    }
  ]
  return options
}

export function getSelectedStartingTiles (elements, sets, start) {
  const options = getStartingTilesOptions(elements, sets)
  let selected = options.find(opt => opt.enabled && start === opt.id)
  if (!selected) {
    selected = options.find(opt => opt.default)
  }
  return selected
}
