module.exports = {
  EmptyArray: Object.freeze([]),

  unSupportedHandler() {
    throw Error() // TODO
  },

  loadFile() {
    console.log(__dirname, __filename)
  },

  resolveIteratorValues(iterator) {
    return Object.values(iterator)
  },

  handleServletError(servlet, error, message) {

  }
}

