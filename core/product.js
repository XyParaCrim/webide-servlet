/**
 * 用于与provider交互
 */
const EventEmitter = require('events').EventEmitter
const utils = require('../core/utils')

/**
 * 1. 提供基本的emitter能力
 * 2. 基于flyweight pattern，为了能够远程快速构造实例
 * 3. 由于2，约定：静态类提供该实例工厂的能力
 */
class Product extends EventEmitter {

  constructor(provider) {
    super()
    this.poison = true
    this.provider = provider
  }

  /**
   * 通用工厂方法
   * @param {Provider} provider
   * @return {Product}
   */
  static create(provider) {
    utils.unSupportedHandler()
  }
}

utils.set('poison-provider', new Product())

module.exports = Product