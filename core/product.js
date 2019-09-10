/**
 * 用于与provider交互
 */
import EventEmitter from 'events'
import * as utils from '../core/utils'


/**
 * 1. 提供基本的emitter能力
 * 2. 基于flyweight pattern，为了能够远程快速构造实例
 * 3. 由于2，约定：静态类提供该实例工厂的能力
 */
class Product extends EventEmitter {

  /**
   * 通用工厂方法
   * @param {Object} options
   * @return {Product}
   */
  static create(options) {
    utils.unSupportedHandler()
  }
}

export default Product