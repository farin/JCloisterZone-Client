
import Emitter from 'tiny-emitter'

export class EventsBase {
  constructor () {
    this.emitter = new Emitter()
  }

  on (event, callback, context) {
    this.emitter.on(event, callback, context)
  }

  once (event, callback, context) {
    this.emitter.once(event, callback, context)
  }

  off (event, callback) {
    this.emitter.off(event, callback)
  }

  emit (event, ...args) {
    this.emitter.emit(event, ...args)
  }
}
