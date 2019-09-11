module.exports = {
  EmptyArray: Object.freeze([]),

  unSupportedHandler() {
    throw Error() // TODO
  },

  loadFile() {

  },

  resolveIteratorValues(iterator) {
    return Object.values(iterator)
  },

  handleServletError(servlet, error, message) {

  }
}

