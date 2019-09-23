/**
 * 用于接收、处理product的交互
 */
const Product = require('./product')
const EventEmitter = require('events').EventEmitter
const utils = require('../core/utils')

/**
 * 1. 提供基本的emitter能力
 * 2. 基于flyweight pattern，为了能够远程快速构造实例
 */
class Provider extends EventEmitter {
  /**
   * @param {Servlet} servlet
   */
  constructor(servlet) {
    super()
    this.alive = false
    this.poison = true // 子类需要自己声明自己是否可用，默认不可用
    this.attached = false
    if ((this.servlet = servlet)) {
      this.decorator = servlet.decorator()
    }
  }

  /**
   * do provide
   */
  attach() {
    utils.unSupportedHandler()
  }

  close() {
    utils.unSupportedHandler()
  }

  /**
   * for log
   */
  detail() {
    return 'Invalid Provider'
  }

  /**
   * 返回product的元数据
   */
  metadata() {
    utils.unSupportedHandler()
  }

  /**
   * 设置元数据，参数key-value，也可以是对象
   * @param key
   * @param value
   */
  set(key, value) {
    utils.unSupportedHandler()
  }

  /**
   * 返回一个与Provider交互的Product实例
   * @return {Product}
   */
  supply() {
    utils.unSupportedHandler()
  }

  /**
   * 通用工厂方法
   * @param {Object} options
   * @param {Servlet} servlet
   * @return {Provider}
   */
  static create(options, servlet) {
    utils.unSupportedHandler()
  }

  /**
   * 通用工厂方法 - 实例un-alive
   * @param options
   * @param {Servlet} servlet
   * @return {Provider}
   */
  static createLazy(options, servlet) {
    utils.unSupportedHandler()
  }

}

utils.set('poison-provider', new Provider())

module.exports = Provider