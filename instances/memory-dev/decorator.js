module.exports = {
  id: function (options) {
    return options.id
  },
  type(options) {
    return options.type
  },
  port(options) {
    return options.port
  },
  namespace(options) {
    return options.id + '#' + options.type
  },
  metadata(options) {
    return options.metadata
  },
  normalize(options) {
    return {
      url: "http://localhost:" + options.port,
      type: options.type,
      metadata: options.options
    }
  }
}
