import Servlet from '../../core/servlet'
import MemoryProduct from './memory-product'
import MemoryProvider from './memory-provider'
import * as utils from '../../core/utils'

const DEFAULT_PRODUCTS_FILE = "products.json"


class MemoryServlet extends Servlet {

  static Product = MemoryProduct
  static Provider = MemoryProvider

  constructor() {
    super()

    this.name = "memory-servlet"
    this.alive = true // always true
    this.productMap = {}
  }

  /**
   * 默认加载本地配置文件
   * @private
   */
  _attach () {
    utils.loadFile(DEFAULT_PRODUCTS_FILE)
      // 解析数组配置，每一项配置初始化一个product
      .then(productConfig => utils.resolveIteratorValues(productConfig).forEach(options => this._makeProduct(options)))
      .catch(error => utils.handleServletError(this, error, `Unable to retrieves products caused by loading file{${DEFAULT_PRODUCTS_FILE} failed`))
  }

  /**
   * 通过一组product options初始化product（任何一个product初始化失败不会影响其他的）。
   * @param {Iterable} productOptions
   * @private
   */
  _makeProduct(productOptions) {
    const productFactory = this.productFactory()
    const productMap = this.productMap

    let productInstance, type
    for (let option of productOptions) {
      try {
        productInstance = productFactory.create(option)
        type = productInstance.type()
      } catch(error) {
        // 忽略此次初始化product instance失败
        utils.handleServletError(this, error, "A product is dropped caused by constructing product instance failed")
        continue
      }

      (productMap[type] || (productMap[type] = Array.of())).push(productInstance)
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

  provide(registerOptions) {
    return super.provide(registerOptions)
  }
}