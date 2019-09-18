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

  constructor(metadata) {
    super()
    this.poison = true
    this.attacted = false
    this.metadata = metadata
  }

  /**
   * 尝试与provider交互
   * @param {Function} callback attached后调用，可以为空
   */
  attach(callback) {
    utils.handleIfFunction(callback)
  }

  /**
   * 简单中间件或者插件
   * @param {Array<function> | function}middles
   */
  use(middles) {
    if (typeof middles === 'function') {
      middles(this)
    } else if (middles instanceof Array) {
      for (let middle of middles) {
        typeof middle === 'function' && middle(this)
      }
    }
  }

  /**
   * 获取元数据
   * @param key
   */
  get(key) {
    // TODO
  }

  /**
   * 通用工厂方法
   * @param {Object} metadata
   * @return {Product}
   */
  static create(metadata) {
    return utils.get('poison-provider')
  }

  /**
   * 返回解析product metadata的parser
   * @return {Parser}
   */
  static parser() {
    utils.unSupportedHandler()
  }

  /**
   * 返回poison为true的product
   * @return {Product}
   */
  static poison() {
    return utils.get('poison-provider')
  }
}

utils.set('poison-provider', new Product())

module.exports = Product