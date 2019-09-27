/**
 * 1.默认加载此文件夹下的eureka-client.yml
 * 2.默认不自动注册到eureka（registerWithEureka = false）
 * 3.默认不自动拉去注册信息（fetchRegistry = false）
 */
const decorator = require('./decorator')
const utils = require('../../core/utils')
const objects = require('../../core/objects')

module.exports = function (Servlet, options) {
  // 检验require选项
  utils.validateConstructor(options, Object, "Invalid options for eureka-dev-servlet: " + options)

  // 设置一些默认值
  options.name = 'eureka-dev-servlet'
  options.serviceType = options.serviceType || objects.DefaultServiceType // 用于标记vipAddress
  options.eurekaOptions = options.eurekaOptions || {}
  options.eurekaOptions.cwd = options.eurekaOptions.cwd || __dirname
  options.eurekaLoggerLevel = options.eurekaLoggerLevel || 'debug'

  return new Servlet(decorator, options)
}