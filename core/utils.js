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
    throw Error("This method is not yet supported.")
  },

  resolveIteratorValues(iterator) {
    return Object.values(iterator)
  },

  handleIfFunction(fn) {
    typeof fn === 'function' && fn.call()
  },

  createArrayAndPush(object, key, item) {
    (object[key] || (object[key] = Array.of())).push(item)
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
  },

  bindProperties(instance, properties) {
    if (properties) {
      for (let [name, value] of Object.entries(properties)) {
        if (!Reflect.has(instance, name)) {
          instance[name] = value
        }
      }
    }
  },

  mergeAdapter(adapter, defaultAdapter) {
    return adapter ? Object.assign({}, defaultAdapter, adapter) : Object.assign({}, defaultAdapter)
  },

  normalizeNamespace(type, id) {
    return type + '#' + id
  },

  /* some validate function */

  validateConstructor(value, Constructor, message) {
    if (value == null || !(value instanceof Constructor)) {
      throw TypeError(message)
    }
  },

  validateNotNull(value, message) {
    if (value == null) {
      throw TypeError(message)
    }
  },

  validateString(value, message) {
    if (!(typeof value === 'string')) {
      throw TypeError(message)
    }
  }
}

