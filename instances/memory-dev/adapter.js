const http = require('http')
const utils = require('../../core/utils')

// TODO 重复代码 eureka-dev/adapter.js
module.exports = {
  normalizeProviderInfo(metadata, memoryServlet, provideOptions) {
    // validate data
    utils.validateConstructor(provideOptions.server, http.Server, "options缺少server(http.Server)")

    let id = this.idFromMetadata(metadata)
    let type = this.typeFromMetadata(metadata)

    // in this step, correctness checking
    let productInfo = this.normalizeProductInfo(metadata, memoryServlet)

    return {
      uuid: (metadata._providerId = utils.generateId()),

      id,
      type,
      port: this.portFromMetadata(metadata),
      server: provideOptions.server,
      // detail 使用
      namespace: utils.normalizeNamespace(type, id),
      // 适配getter和setter
      metadata,

      productInfo
    }
  },

  normalizeProductInfo(metadata, memoryServlet) {
    // 添加必要的检测
    utils.validateNotNull(metadata.id, "metadata缺少id(product id)")
    utils.validateNotNull(metadata.type, "metadata缺少type(product type)")
    utils.validateNotNull(metadata.host, "metadata缺少host")
    utils.validateNotNull(metadata.port, "metadata缺少post")

    return {
      pid: metadata.id,
      uuid: utils.generateId(),
      type: this.typeFromMetadata(metadata),
      providerId: metadata._providerId,
      // 不需要从请求路径获取serviceId
      path: "",
      url: this.hostFromMetadata(metadata) + ":" + this.portFromMetadata(metadata),
      metadata
    }
  }
}
