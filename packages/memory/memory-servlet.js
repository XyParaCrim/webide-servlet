const Servlet = require('../../core/servlet')
const MemoryProduct = require('./memory-product')
const MemoryProvider = require('./memory-provider')
const utils = require('../../core/utils')
const Debug = require('debug')

const debug = Debug('webide-servlet:memory-servlet')
const DEFAULT_PRODUCTS_FILE = "products.json"

const P = {
  id(productOptions) {
    return productOptions.id
  },
  type(productOptions) {
    return productOptions.type
  },
  simpleCheckProductOptions() {}
}

class MemoryServlet extends Servlet {

  static Product = MemoryProduct
  static Provider = MemoryProvider

  constructor() {
    super()

    this.name = "memory-servlet"
    this.alive = true // always true
    this.parser = P
    this.productOptionMap = {}
    this.providerMap = {}

    this._attach()
  }

  /**
   * 默认加载本地配置文件
   * @private
   */
  _attach () {
    debug("load products file(%s)", DEFAULT_PRODUCTS_FILE)
    utils.loadFile(DEFAULT_PRODUCTS_FILE)
      // 解析数组配置，每一项配置初始化一个product
      .then(productConfig => utils.resolveIteratorValues(productConfig).forEach(options => this._addProductOptions(options)))
      .catch(error => utils.handleServletError(this, error, `Unable to retrieves products caused by loading file{${DEFAULT_PRODUCTS_FILE} failed`))
  }

  /**
   * 记录product options
   * @param {Object} productOptions
   * @private
   */
  _addProductOptions(productOptions) {
    const parser = this.parser
    const optionMap = this.productOptionMap
    if (parser.simpleCheckProductOptions(productOptions)) {
      let type = parser.type(productOptions);
      (optionMap[type] || (optionMap[type] = Array.of())).push(productOptions)
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
    const parser = this.parser
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

module.exports = MemoryServlet