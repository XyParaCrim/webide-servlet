const utils = require('../../../core/utils')
const debug = require('debug')('webide-servlet:eureka-servlet')
const logger = require('../../../core/logger')

const Servlet = require('../../../core/servlet')
const Eureka = require('eureka-js-client').Eureka
const defaultDecorator = require('./decorator')

/**
 * Eureka implement
 * 1.http与注册中心通讯
 * 2.通过eureka-js-client拼装传输数据格式
 */
class EurekaServlet extends Servlet {

  /**
   * eureka-js-client options
   * @param options
   * @param decorator
   */
  constructor(decorator, options) {
    super(utils.mergeDecorator(decorator, defaultDecorator), options)

    this.name = this.name || 'eureka-servlet'
    this.alive = true
    this.provider = null
  }

  /**
   * 1.默认不自动注册，不自动拉去注册服务
   */
  attach(afterAttached) {
    if (this.attached) {
      utils.handleIfFunction(afterAttached)
    } else {
      debug('init eureka-client')

      let eurekaOptions = this.eurekaOptions // 默认这就是eureka options
      let client

      try {
        client = this.client = new Eureka(eurekaOptions)
      } catch (e) {
        logger.error(this, "Failed to create eureka-client instance", e, true)
      }

      logger.info(this, 'set eureka-client logger level: ' + this.eurekaLoggerLevel)

      client.logger.level(this.eurekaLoggerLevel)
      client.start(e => {
        if (e) {
          logger.error(this, '无法初始化eureka-client', e, true)
        } else {
          logger.info(this, 'eureka-client is started')

          this.attached = true
          utils.handleIfFunction(afterAttached)
        }
      })
    }
  }

  /**
   * 只支持单个进程单个服务注册，所以始终返回一个provider对象
   * @see Servlet.prototype.provide
   */
  provide(metadata, options) {
    this._validateAttached()

    const client = this.client
    const decorator = this.decorator()
    const providerFactory = this.providerFactory()
    const eurekaInstanceConfig = client.config.instance

    if (!this.provider) {
      decorator.normalizeEurekaInstanceConfig(metadata, eurekaInstanceConfig, this)

      // 创建一个un-attach的provider对象
        this.provider = providerFactory
          .createLazy(decorator.normalizeProviderInfo(eurekaInstanceConfig, this, options))
    }

    if (!this.provider.attached) {
      this._registerWithEureka()
      this.provider.attach()
    }

    return this.provider
  }

  _registerWithEureka() {
    this.client.register(e => {
      if (e) {
        logger.error(this, 'Unable to register instance', e)
      } else {
        logger.info(this, "register successfully")
        this._heartBeats()
      }
    })
  }

  _heartBeats() {
    this.client.heartbeat || this.client.startHeartbeats()
  }

  _validateAttached() {
    if (!this.attached) {
      throw Error("Please attach servlet")
    }
  }

  /**
   * @see Servlet.prototype.supply
   */
  supply(type, id) {
    let productInfo = this.productInfo(type, id)

    return productInfo ? this.providerFactory().createProduct(productInfo) : null
  }

  /**
   * @see Servlet.prototype.supplyAll
   */
  supplyAll() {
    return this.allProductInfo().map(info => this.providerFactory().createProduct(info))
  }

  /**
   * @see Servlet.prototype.supplyByType
   */
  supplyByType(type) {
    return this.productInfoByType(type).map(info => this.providerFactory().createProduct(info))
  }

  /**
   * @see Servlet.prototype.supplyById
   */
  supplyById(id) {
    return this.productInfoById(id).map(info => this.providerFactory().createProduct(info))
  }

  /**
   * Servlet.prototype.detail
   */
  detail() {
    return `${this.name}{ alive: ${this.alive}, attached: ${this.attached} }`
  }

  /**
   * @see Servlet.prototype.productInfo
   */
  productInfo(type, id) {
    this._validateAttached()

    let namespace = utils.normalizeNamespace(type, id)
    let instancesConfig = this.client.getInstancesByVipAddress(namespace)

    if (instancesConfig.length > 1) {
      logger.warn(this, `${instancesConfig.length} same namespace(${namespace}) products exist, and return first`)
    }

    // 如果存在多个相同则返回第一个
    return instancesConfig[0] ? this.decorator().normalizeProductInfo(instancesConfig[0], this) : null
  }

  /**
   * @see Servlet.prototype.allProductInfo
   */
  allProductInfo() {
    let serviceType = this.serviceType
    let instancesConfig = this.client.getInstancesByAppId(serviceType)

    return instancesConfig.map(instanceConfig => this.decorator().normalizeProductInfo(instanceConfig, this))
  }

  /**
   * @see Servlet.prototype.productInfoById
   */
  productInfoById(id) {
    let suffix =  "-" + id

    return this._iterateAppsMatchBy(name => name.endsWith(suffix))
  }

  /**
   * @see Servlet.prototype.productInfoByType
   */
  productInfoByType(type) {
    let prefix =  type + "-"

    return this._iterateAppsMatchBy(name => name.startsWith(prefix))
  }

  _iterateAppsMatchBy(match) {
    let cache = this.client.cache.vip
    let instancesConfig = []

    for (let [name, instances] of Object.entries(cache)) {
      if (instances && instances.length && match(name)) {
        instancesConfig.push.apply(instancesConfig, instances)
      }
    }

    return instancesConfig.map(instanceConfig => this.decorator().normalizeProductInfo(instanceConfig, this))

  }

  /**
   * @see Servlet.prototype.autoUpdateProductInfo
   */
  autoUpdateProductInfo() {
    this._validateAttached()

    this.client.registryFetch || this.client.startRegistryFetches()
    this.client.fetchRegistry()
  }
}

module.exports = EurekaServlet
