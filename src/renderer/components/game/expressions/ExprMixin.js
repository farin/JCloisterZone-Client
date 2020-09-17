export default {
  computed: {
    name () {
      return this.expr.name.split('+')[0]
    }
  }
}
