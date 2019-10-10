/**
 * 服务中心，可以获取到product，provider，etc实例，实现方式
 * 可以远程注册中心或者内存储存
 */
const utils = require('./utils')
const Provider = require('./provider')
const defaultAdapter = require('./adapter')

class Servlet {
  constructor (adapter, options) {
    if (!adapter) {
      throw TypeError("缺少参数-adapter")
    }

    this.alive = false
    this.attached = false
    this.factory = Provider
    this.adapterObject = utils.mergeAdapter(adapter, defaultAdapter)
    utils.bindProperties(this, options)
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
   * @param type
   * @param id
   * @returns {Product}
   */
  supply(type, id) {
    utils.unSupportedHandler()
  }

  /**
   * @returns {Array<Provider>}
   */
  supplyAll() {
    utils.unSupportedHandler()
  }

  /**
   * 根据type筛选
   * @param type
   * @return {Array<Provider>}
   */
  supplyByType(type) {
    utils.unSupportedHandler()
  }


  /**
   * 根据id筛选
   * @param id
   * @return {Array<Provider>}
   */
  supplyById(id) {
    utils.unSupportedHandler()
  }

  /**
   * 注册product，返回一个provider实例
   * @param metadata
   * @param options 可选参数，根据不同实现传入
   * @return {Provider}
   */
  provide(metadata, options) {
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
   * 返回已注册的product唯一数据
   * @param type
   * @param id
   * @return {JSON}
   */
  productInfo(type, id) {
    utils.unSupportedHandler()
  }

  /**
   * 根据type返回所有type的info
   * @param type
   * @return {Array<JSON>}
   */
  productInfoByType(type) {
    utils.unSupportedHandler()
  }

  /**
   * 根据id返回所有type的info
   * @param id
   * @return {Array<JSON>}
   */
  productInfoById(id) {
    utils.unSupportedHandler()
  }

  /**
   * @return {Array<JSON>}
   */
  allProductInfo() {
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
  adapter() {
    return this.adapterObject
  }
}

module.exports = Servlet