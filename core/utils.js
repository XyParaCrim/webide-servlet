const base64id = require('base64id');
const map = new Map()

module.exports = {
  set: map.set.bind(map),
  get: map.get.bind(map),


  EmptyArray: Object.freeze([]),

  generateId() {
    return base64id.generateId()
  },

  unSupportedHandler() {
    throw Error() // TODO
  },

  resolveIteratorValues(iterator) {
    return Object.values(iterator)
  },

  handleServletError(servlet, error, message) {

  },

  handleServletWarn(servlet, message) {

  },

  handleIfFunction(fn) {
    typeof fn === 'function' && fn.call()
  }
}

