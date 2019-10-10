/**
 * 简单规定metadata一共以下这几个
 */

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

  hostFromMetadata(metadata) {
    return metadata.host
  }
}