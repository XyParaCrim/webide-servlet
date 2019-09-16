const fs = require('fs')
const map = new Map()

module.exports = {
  set: map.set.bind(map),
  get: map.get.bind(map),


  EmptyArray: Object.freeze([]),

  unSupportedHandler() {
    throw Error() // TODO
  },

  loadFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.access(filePath, fs.constants.F_OK, error => {
        if (error) {
          return reject(error)
        }

        resolve(require(filePath))
      })
    })
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

