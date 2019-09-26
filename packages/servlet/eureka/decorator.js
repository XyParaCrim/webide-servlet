const objects = require('../../../core/objects')
const utils = require('../../../core/utils')

module.exports = {
  normalizeEurekaInstanceConfig(metadata, eurekaInstanceConfig, eurekaServlet) {

    // 添加必要的检测
    utils.validateNotNull(metadata.id, "metadata缺少id(product id)")
    utils.validateNotNull(metadata.type, "metadata缺少type(product type)")
    utils.validateNotNull(metadata.host, "metadata缺少host")
    utils.validateNotNull(metadata.port, "metadata缺少post")

    // 拼装eureka-client config
    eurekaInstanceConfig.metadata = metadata
    eurekaInstanceConfig.app = `${metadata.type}-${metadata.id}`
    eurekaInstanceConfig.vipAddress = eurekaServlet.serviceType || objects.DefaultServiceType
    eurekaInstanceConfig.hostName = eurekaServlet.hostName || metadata.host
    eurekaInstanceConfig.ipAddr = eurekaServlet.ipAddr || metadata.host
    eurekaInstanceConfig.port = {
      '$': metadata.port,
      '@enabled': true
    }
    eurekaInstanceConfig.dataCenterInfo = {
      'name': 'MyOwn',
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo'
    }
    eurekaInstanceConfig.instanceId = eurekaInstanceConfig.hostName + ':'
      + eurekaInstanceConfig.app + ':' + eurekaInstanceConfig.port.$
  }
}