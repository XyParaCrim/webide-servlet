/**
 * 服务中心，可以获取到product，provider，etc实例，实现方式
 * 可以远程注册中心或者内存储存
 */
const utils = require('./utils')
const Provider = require('./provider')

class Servlet {
  constructor () {
    this.alive = false
    this.attached = false
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
   * 根据提供的筛选条件，返回结果,且结果非空
   * @param filterOptions
   */
  getProvider(filterOptions) {
    utils.unSupportedHandler()
  }


  providerFactory() {
    return this.constructor.Provider
  }
}

Servlet.Provider = Provider

module.exports = Servlet