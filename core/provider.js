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
  constructor() {
    super()
    this.alive = false
    this.poison = true // 子类需要自己声明自己是否可用，默认不可用
    this.attached = false
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
   * 返回product的元
   */
  metadata() {
    utils.unSupportedHandler()
  }

  /**
   * 返回一个与Provider交互的Product实例
   * @return {Provider.Product}
   */
  supply() {
    return this.productFactory().create(this.metadata())
  }

  productFactory() {
    return this.constructor.Product
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

Provider.Product = Product

utils.set('poison-provider', new Provider())

module.exports = Provider