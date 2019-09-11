/**
 * 服务中心，可以获取到product，provider，etc实例，实现方式
 * 可以远程注册中心或者内存储存
 */
const utils = require('./utils')
const Product = require('./product')
const Provider = require('./provider')

class Servlet {
  constructor () {
    this.alive = false
  }

  /**
   * 1.当没有参数时，返回所有注册的products
   * 2.如果提供筛选条件，则返回筛选后的结果
   * @param type
   * @param filterOptions
   * @returns {ReadonlyArray<Servlet.Product>}
   */
  products (type, filterOptions) {
    return utils.EmptyArray
  }

  /**
   * 注册product，返回一个provider实例
   * @param options
   * @return {Servlet.Provider}
   */
  provide (options) {
    utils.unSupportedHandler()
  }

  productFactory() {
    return this.constructor.Product
  }

  providerFactory() {
    return this.constructor.Provider
  }
}

Servlet.Product = Product
Servlet.Provider = Provider

module.exports = Servlet