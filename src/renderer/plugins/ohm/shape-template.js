import ohm from 'ohm-js'
import PathTemplateGrammar from './shape-template.ohm'

export const grammar = ohm.grammar(PathTemplateGrammar)

export const semantics = grammar.createSemantics().addOperation('getRefs', {
  ShapeElement (a, b, c, d) {
    return []
  },

  PathTemplate (f1, expr, f2) {
    return expr.getRefs()
  },

  _iter (...args) {
    const refs = []
    args.forEach(a => refs.push(...a.getRefs()))
    return refs
  },

  Expr (ppen, body, close) {
    return body.getRefs()
  },

  literal (a, b, c) {
    return []
  },

  path_ref (a, b, c, d) {
    return [this.sourceString]
  },

  var_transform (name, pipeOp, transform) {
    return name.getRefs()
  }
})
