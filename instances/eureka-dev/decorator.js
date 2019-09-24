module.exports = {
  id: function (options) {
    return options.metadata.id
  },
  type(options) {
    return options.metadata.type
  },
  port(options) {
    return options.metadata.service
  },
  namespace(options) {
    return options.metadata.type + '#' + options.metadata.id
  },
  metadata(options) {
    return options.metadata
  },
  normalize(options) {
    return {
      id: options.metadata.id,
      url: options.hostName + ":" + options.metadata.service,
      type:  options.metadata.type.toLocaleLowerCase(),
      metadata: options.metadata
    }
  }
}
