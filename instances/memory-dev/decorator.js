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
    return options
  },
  normalize(options) {
    return {
      id: options.id,
      url: options.host + ":" + options.service,
      type: options.type,
      metadata: options
    }
  }
}
