const objects = require('../../../core/objects')
const utils = require('../../../core/utils')

module.exports = {

  /* default implement */

  normalizeEurekaInstanceConfig(metadata, eurekaInstanceConfig, eurekaServlet) {

    // 添加必要的检测
    utils.validateNotNull(metadata.id, "metadata缺少id(product id)")
    utils.validateNotNull(metadata.type, "metadata缺少type(product type)")
    utils.validateNotNull(metadata.host, "metadata缺少host")
    utils.validateNotNull(metadata.port, "metadata缺少post")

    let id = this.idFromMetadata(metadata)
    let type = this.typeFromMetadata(metadata)
    let host = this.hostFromMetadata(metadata)
    let port = this.portFromMetadata(metadata)

    // 拼装eureka-client config
    eurekaInstanceConfig.metadata = metadata
    eurekaInstanceConfig.app = `${type}-${id}`
    eurekaInstanceConfig.vipAddress = eurekaServlet.serviceType || objects.DefaultServiceType
    eurekaInstanceConfig.hostName = eurekaServlet.hostName || host
    eurekaInstanceConfig.ipAddr = eurekaServlet.ipAddr || host
    eurekaInstanceConfig.port = { '$': port, '@enabled': true }
    eurekaInstanceConfig.dataCenterInfo = {
      'name': 'MyOwn',
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo'
    }
    eurekaInstanceConfig.instanceId = eurekaInstanceConfig.hostName + ':'
      + eurekaInstanceConfig.app + ':' + eurekaInstanceConfig.port.$
  },

  /* The following methods need to be implemented */

  normalizeProviderInfo(eurekaInstanceConfig, eurekaServlet, provideOptions) {
    utils.unSupportedHandler()
  },

  normalizeProductInfo(eurekaInstanceConfig, eurekaServlet) {
    utils.unSupportedHandler()
  }
}