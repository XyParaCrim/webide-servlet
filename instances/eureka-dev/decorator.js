const utils = require('../../core/utils')
const http = require('http')

module.exports = {
  normalizeProviderInfo(eurekaInstanceConfig, eurekaServlet, provideOptions) {
    const metadata = eurekaInstanceConfig.metadata

    // validate data
    utils.validateConstructor(provideOptions.server, http.Server, "options缺少server(http.Server)")

    metadata._providerId = utils.generateId()

    return {
      id: metadata._providerId,
      // socket-io 使用的数据
      type: metadata.type,
      port: metadata.port,
      server: provideOptions.server,
      namespace: this.namespaceFromMetadata(metadata),

      metadata: metadata,

      productInfo: this.normalizeProductInfo(eurekaInstanceConfig, eurekaServlet),
      instanceConfig: eurekaInstanceConfig
    }
  },

  normalizeProductInfo(eurekaInstanceConfig, eurekaServlet) {
    const metadata = eurekaInstanceConfig.metadata

    return {
      id: utils.generateId(),
      providerId: metadata._providerId,
      url: eurekaInstanceConfig.hostName + ":" + this.portFromMetadata(metadata),
      metadata: metadata
    }
  }
}
