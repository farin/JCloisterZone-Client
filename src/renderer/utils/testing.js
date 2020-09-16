import isNil from 'lodash/isNil'

const findPlayerIndex = (state, name) => {
  return state.players.findIndex(p => p.name === name)
}

class PointsAssert {
  REGEXP = /(\w+) has (\d+) points?/

  constructor (state) {
    this.state = state
  }

  verify (assertion) {
    const m = this.REGEXP.exec(assertion)
    if (m) {
      const player = this.state.players[findPlayerIndex(this.state, m[1])]
      const points = parseInt(m[2])
      return { result: player.points === points }
    }
  }
}

class FeatureScoredAssert {

  REGEXP = /(\w+) scored (\w+) for (\d+) points?/

  constructor (state) {
    this.state = state
  }

  verify (assertion) {
    const m = this.REGEXP.exec(assertion)
    if (m) {
      const playerIdx = findPlayerIndex(this.state, m[1])
      const feature = m[2]
      const points = parseInt(m[3])

      if (!this.state.history) {
        return { result: false }
      }

      const result = !!this.state.history
        .flatMap(h => h.events)
        .filter(({ type }) => type === 'points')
        .flatMap(ev => ev.points)
        .find(pts => pts.player === playerIdx && pts.points === points && pts.name.split('.')[0] === feature)

      return { result }
    }
  }
}

class PassAssert {
  constructor (state) {
    this.state = state
  }

  verify (assertion) {
    if (assertion === "Player can't pass") {
      return { result: !this.state.action.canPass }
    }
    if (assertion === "Player can pass") {
      return { result: this.state.action.canPass }
    }
  }
}

export function verifyScenario(state, { description, assertions }) {
  const result = {
    description,
    assertions: []
  }

  const rules = [
    new PointsAssert(state),
    new FeatureScoredAssert(state),
    new PassAssert(state)
  ]

  for (let assertion of assertions) {
    let assertionResult = null
    for (let rule of rules) {
      const ruleResult = rule.verify(assertion)
      if (!isNil(ruleResult)) {
        assertionResult = {
          assertion,
          ...ruleResult
        }
        break
      }
    }
    if (assertionResult === null) {
      assertionResult = {
        assertion,
        error: 'Unknown assertion',
        result: false
      }
    }
    result.assertions.push(assertionResult)
  }

  return result
}
