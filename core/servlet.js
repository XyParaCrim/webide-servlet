/**
 * 服务中心，可以获取到product，provider，etc实例，实现方式
 * 可以远程注册中心或者内存储存
 */
const utils = require('./utils')
const Provider = require('./provider')

class Servlet {
  constructor (decorator) {
    if (!decorator) {
      throw TypeError("缺少参数-decorator")
    }

    this.alive = false
    this.attached = false
    this.decoratorObject = decorator
    this.factory = Provider
  }

  /**
   * 启动servlet
   * @param {Function} afterAttached
   */
  attach(afterAttached) {
    utils.unSupportedHandler()
  }

  /**
   * 与attach方法相反
   */
  close() {
    utils.unSupportedHandler()
  }

  /**
   * 根据提供的筛选条件，返回结果，且结果非空({Servlet.Provider}的委托函数)
   * @param filterOptions
   * @returns {Servlet.Provider.Product}
   */
  supply(filterOptions) {
    utils.unSupportedHandler()
  }

  /**
   * 如果提供type则筛选，反之，则返回所有的products
   * @param type
   * @returns {Array<Servlet.Provider.Product>}
   */
  supplies(type) {
    utils.unSupportedHandler()
  }

  /**
   * 注册product，返回一个provider实例
   * @param options
   * @return {Servlet.Provider}
   */
  provide(options) {
    utils.unSupportedHandler()
  }

  /**
   * for log
   */
  detail() {
    return 'Invalid Servlet'
  }

  /**
   * 根据提供的筛选条件，返回结果,且结果非空
   * @param filterOptions
   */
  getProvider(filterOptions) {
    utils.unSupportedHandler()
  }

  /**
   * 返回已注册的product数据数组
   * @param type
   * @return {Array<JSON>}
   */
  getProductInfo(type) {
    utils.unSupportedHandler()
  }


  providerFactory(factory) {
    if (arguments.length > 0) {
      this.factory = factory
    }

    return this.factory
  }

  /**
   * 是否自动更新ProductInfo
   */
  autoUpdateProductInfo() {
    utils.unSupportedHandler()
  }

  /**
   * 用于传入到不同实现的provider里(暂时:最简单的实现就是仅仅对option的解析)
   * @return {Object}
   */
  decorator() {
    return this.decoratorObject
  }
}

module.exports = Servlet