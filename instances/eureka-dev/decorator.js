module.exports = {
  id: function (options) {
    return options.metadata.id
  },
  type(options) {
    return options.metadata.type
  },
  port(options) {
    return options.metadata.port
  },
  namespace(options) {
    return options.metadata.type + '#' + options.metadata.id
  },
  metadata(options) {
    return options.metadata
  },
  normalize(options) {
    return {
      url: options.hostName + ":" + options.metadata.port,
      type:  options.metadata.type,
      metadata: options.metadata
    }
  }
}
