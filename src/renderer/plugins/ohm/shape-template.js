import ohm from 'ohm-js'
import PathTemplateGrammar from './shape-template.ohm'

export const grammar = ohm.grammar(PathTemplateGrammar)

export const semantics = grammar.createSemantics().addOperation('getRefs', {
  ShapeElement (a, b, c, d) {
    return { expr: false, refs: [] }
  },

  PathTemplate (f1, expr, f2) {
    return expr.getRefs()
  },

  _iter (...args) {
    const r = { expr: false, refs: [] }
    args.forEach(a => {
      const { expr, refs } = a.getRefs()
      r.expr ||= expr
      r.refs.push(...refs)
    })
    return r
  },

  Expr (ppen, body, close) {
    return { expr: true, refs: body.getRefs() }
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
