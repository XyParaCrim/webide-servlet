const utils = require('../../core/utils')
const http = require('http')

// TODO 重复代码 memory-dev/adapter.js
module.exports = {
  normalizeProviderInfo(eurekaInstanceConfig, eurekaServlet, provideOptions) {
    const metadata = eurekaInstanceConfig.metadata

    // validate data
    utils.validateConstructor(provideOptions.server, http.Server, "options缺少server(http.Server)")

    let id = this.idFromMetadata(metadata)
    let type = this.typeFromMetadata(metadata)

    // 返回provider-info
    return {
      uuid: (metadata._providerId = utils.generateId()),
      // socket-io 使用的数据
      id,
      type,
      port: this.portFromMetadata(metadata),
      server: provideOptions.server,
      // detail 使用
      namespace: utils.normalizeNamespace(type, id),
      // 适配getter和setter
      metadata,

      productInfo: this.normalizeProductInfo(eurekaInstanceConfig, eurekaServlet),
      instanceConfig: eurekaInstanceConfig
    }
  },

  normalizeProductInfo(eurekaInstanceConfig, eurekaServlet) {
    const metadata = eurekaInstanceConfig.metadata

    // 返回product-info
    return {
      uuid: utils.generateId(),
      type: this.typeFromMetadata(metadata),
      providerId: metadata._providerId,
      path: `/service/${metadata.type}/${metadata.id}`,
      url: eurekaInstanceConfig.hostName + ":" + 9530,
      metadata: metadata
    }
  }
}
