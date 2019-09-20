const base64id = require('base64id');
const map = new Map()

module.exports = {

  /* 存储全局变量 for this project */

  set: map.set.bind(map),

  get: map.get.bind(map),

  /* generate uniqueness identifier */

  generateId() {
    return base64id.generateId()
  },

  unSupportedHandler() {
    throw Error() // TODO
  },

  resolveIteratorValues(iterator) {
    return Object.values(iterator)
  },

  handleIfFunction(fn) {
    typeof fn === 'function' && fn.call()
  },

  createExpiredFunction(deadline, timeout, expire) {
    let called = false
    let expired = false

    function expiredFunction () {
      called = true
      expired || deadline.apply(null, arguments)
    }

    setTimeout(() => {
      expired = true
      called || timeout()
    }, expire)

    return expiredFunction
  }
}

