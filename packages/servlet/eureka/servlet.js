const utils = require('../../../core/utils')
const debug = require('debug')('webide-servlet:eureka-servlet')
const logger = require('../../../core/logger')

const Servlet = require('../../../core/servlet')
const Eureka = require('eureka-js-client').Eureka

/**
 * Eureka implement
 * 1.http与注册中心通讯
 * 2.通过eureka-js-client拼装传输数据格式
 */
class EurekaServlet extends Servlet {

  /**
   * eureka-js-client options
   * @param options
   */
  constructor(options) {
    super()

    this.name = 'eureka-servlet'
    this.alive = true
    this.options = options
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

      let options = this.options // 默认这就是eureka options
      let client

      try {
        client = this.client = new Eureka(options)
      } catch (e) {
        logger.error(this, "Failed to create eureka-client instance", e, true)
      }


      client.logger.level('debug')
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
   */
  provide(metadata) {
    this._validateAttached()

    const providerFactory = this.providerFactory()

    if (!this.provider) {
      const client = this.client

      this.provider = providerFactory.createLazy(client.config.instance, this)
      this._resolveEurekaInstanceData(metadata)
      this._registerWithEureka()
    }

    return this.provider
  }

  // TODO
  _resolveEurekaInstanceData(metadata) {
    const instance = this.client.config.instance

    instance.app = metadata.name
    instance.vipAddress = metadata.type
    instance.hostName = instance.ipAddr = '127.0.0.1'
    instance.port = { '$': 8080, '@enabled': true }
    instance.dataCenterInfo = { name: 'MyOwn', '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo' }
    instance.metadata = metadata
  }

  _registerWithEureka() {
    this.client.register(e => {
      if (e) {
        logger.error(this, 'Unable to register instance', e)
      } else {
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

  supply(filterOptions) {
    utils.unSupportedHandler()
    this._validateAttached()
  }

  detail() {
    return `${this.name}{ alive: ${this.alive}, attached: ${this.attached} }`
  }

  getProductInfo(type) {
    this._validateAttached()

    return this.client.getInstancesByVipAddress(type).map(this.decorator().normalize)
  }
}

module.exports = EurekaServlet