module.exports = {
  idFromMetadata(metadata) {
    return metadata.id
  },

  typeFromMetadata(metadata) {
    return metadata.type
  },

  portFromMetadata(metadata) {
    return metadata.port
  },

  namespaceFromMetadata(metadata) {
    return this.idFromMetadata(metadata) + '#' + this.typeFromMetadata(metadata)
  },

  metadataFromProductInfo(productInfo) {
    return productInfo.metadata
  }
}