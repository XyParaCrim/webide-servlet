const utils = require('../../core/utils')
const debug = require('debug')('webide-servlet:eureka-servlet')
const logger = require('../../core/logger')

const Servlet = require('../../core/servlet')
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
  }


  attach(afterAttached) {
    if (this.attached) {
      utils.handleIfFunction(afterAttached)
    } else {
      debug('init eureka-client')

      const options = this.options // 默认这就是eureka options
      const client = this.client = new Eureka(options)

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
}

module.exports = EurekaServlet