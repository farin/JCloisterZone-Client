import ohm from 'ohm-js'
import PathTemplateGrammar from './shape-template.ohm'

export const grammar = ohm.grammar(PathTemplateGrammar)

export const semantics = grammar.createSemantics().addOperation('getRefs', {
  ShapeElement (a, b, c, d) {
    return []
  },

  // Expr (_a, body, _b) {
  //   return [body]
  // }
  PathTemplate (a, b, c) {
    console.log(`PT >>>${a.sourceString}<<< >>>${b.sourceString}<<< >>>${c.sourceString}<<<`)
    console.log(this, a, b, c)
    return []
  }
  // Expr (_1, body, _2) {
  //   console.log('EXPR', body)
  //   return e.eval()
  // }
})
