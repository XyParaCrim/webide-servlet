const Servlet = require('../../core/servlet')
const MemoryProduct = require('./memory-product')
const MemoryProvider = require('./memory-provider')
const utils = require('../../core/utils')
const Debug = require('debug')
const path = require('path')

const debug = Debug('webide-servlet:memory-servlet')
const defaultParser = {
  path(options) {
    return path.resolve(options.cwd, options.filename)
  }
}

class MemoryServlet extends Servlet {
  constructor(options) {
    super()

    this.name = "memory-servlet"
    this.alive = true // always true
    this.options = options
    this.parser = defaultParser
    this.providerMap = {}
    this._attach()
  }

  /**
   * 默认加载本地配置文件
   * @private
   */
  _attach () {
    const options = this.options
    const parser = this.parser

    let path = parser.path(options)

    debug("loading products file(%s)", path)

    utils.loadFile(path)
      // 解析数组配置，每一项配置初始化一个product
      .then(productConfig => utils.resolveIteratorValues(productConfig).forEach(options => this._addLazyProvider(options)))
      .catch(error => utils.handleServletError(this, error, `Unable to retrieves products caused by loading file{${path} failed`))
  }

  /**
   * 通过product-options创建lazy provider
   * @param {Object} productOptions
   * @private
   */
  _addLazyProvider(productOptions) {
    const providerFactory = this.providerFactory()
    const providerParser = providerFactory.parser()
    const providerMap = this.providerMap

    let namespace = providerParser.namespace(productOptions)
    let provider = providerMap[namespace]
    if (provider && provider.alive) {
      // 首先处理此namespace下已存在的provider
      // 原则上，如果alive，则旧的优先，反之，则旧的优先
      utils.handleServletWarn(this, `A product{${namespace}} is dropped caused by existed`)
    } else {
      // un-alive -> replace
      debug('creating lazy provider(%s)', namespace)

      provider = providerFactory.createLazy(productOptions)

      // check 这个返回的provider是否完好无损的，若是poison则drop it, 维持原provider options
      if (provider.poison) {
        debug('creating lazy provider(%s) failed', namespace)
      } else {
        debug('creating lazy provider(%s) done', namespace)
        providerMap[namespace] = provider
      }
    }
  }

  products(type, filterOptions) {
    if (!type) {
      throw new TypeError('Unable to query products with no type');
    }

    let productMap = this.productMap
    let products = productMap[type] || Array.of()
    if (filterOptions) { /* TODO */ }

    return products
  }

  provide(options) {
    const providerMap = this.providerMap
    const optionMap = this.productOptionMap
    const providerFactory = this.providerFactory()

    let id = parser.id(options)
    let type = parser.type(options)

    // 首先，检查是否已经有同样的provider实例
    let namespace = type + '#' + id
    let provider = providerMap[namespace]
    if (provider) {
      // 检查是否已经失活，若失活则删除原实例，重新provide
      return provider
    }

    // 其次，检查是否拥有相同namespace的配置，若有则认为此调用只是激活原配置，反之返回一个空Provide
    // memory-servlet默认只支持初始化加载的product option
    let error
    try {
      if ((options = optionMap[type]) && (options = options[id])) {
        provider = providerFactory.create(options)
        providerMap[namespace] = provider

        debug('provided a product(%s)', namespace)
      } else {
        error = Error("Product option does not exist")
      }
    } catch (e) {
      error = e
    }

    error && utils.handleServletError(this, error, `Unable to provide the product{type = ${type}, id = ${id}`)

    return provider
  }
}

MemoryServlet.Provider = MemoryProvider
MemoryServlet.Product = MemoryProduct

module.exports = MemoryServlet