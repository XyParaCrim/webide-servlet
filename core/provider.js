/**
 * 用于接收、处理product的交互
 */
const EventEmitter = require('events').EventEmitter
const utils = require('../core/utils')

/**
 * 1. 提供基本的emitter能力
 * 2. 基于flyweight pattern，为了能够远程快速构造实例
 */
class Provider extends EventEmitter {
  constructor() {
    super()
    this.alive = false
    this.poison = false
  }

  /**
   * 通用工厂方法
   * @param {Object} options
   * @return {Provider}
   */
  static create(options) {
    utils.unSupportedHandler()
  }

  /**
   * 通用工厂方法 - 实例un-alive
   * @param options
   * @return {Provider}
   */
  static createLazy(options) {
    utils.unSupportedHandler()
  }

  /**
   * 返回解析provider options的parser
   * @return {Parser}
   */
  static parser() {
    utils.unSupportedHandler()
  }
}

module.exports = Provider