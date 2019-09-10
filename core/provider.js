/**
 * 用于接收、处理product的交互
 */
import * as utils from '../core/utils'
import EventEmitter from 'events'

/**
 * 1. 提供基本的emitter能力
 * 2. 基于flyweight pattern，为了能够远程快速构造实例
 */
class Provider extends EventEmitter {
  constructor() {
    super()
    this.alive = false
  }

  /**
   * 通用工厂方法
   * @param {Object} options
   * @return {Provider}
   */
  static create(options) {
    utils.unSupportedHandler()
  }
}

export default Provider