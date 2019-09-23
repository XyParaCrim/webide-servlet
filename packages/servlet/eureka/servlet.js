const utils = require('../../../core/utils')
const debug = require('debug')('webide-servlet:eureka-servlet')
const logger = require('../../../core/logger')

const Servlet = require('../../../core/servlet')
const Eureka = require('eureka-js-client').Eureka
const MemoryProvider = require('../../provider-product/socket-io/provider')

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
  provide(options) {
    this._validateAttached()

    const providerFactory = this.providerFactory()
    const client = this.client
    const provider = this.provider || providerFactory.createLazy(client.config.instance, this)

    this._registerWithEureka()

    return provider
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
    this._validateAttached()

    console.log(this.client.cache.app[0])
  }
}

EurekaServlet.Provider = MemoryProvider

module.exports = EurekaServlet