const Servlet = require('../../../core/servlet')
const utils = require('../../../core/utils')
const objects = require('../../../core/objects')
const io = require('../../../core/io')
const logger = require('../../../core/logger')
const debug = require('debug')('webide-servlet:memory-servlet')
const defaultDecorator = require('./decorator')

class MemoryServlet extends Servlet {
  constructor(decorator, options) {
    super(utils.mergeDecorator(decorator, defaultDecorator), options)

    this.name = this.name || "memory-servlet"
    this.alive = true // always true
    this.providerHash = {}
    this.providerIndex = { id: {}, type: {} }
  }

  /**
   * 默认只是加载本地配置文件
   * @param callback
   */
  attach (callback) {
    if (this.attached) {
      utils.handleIfFunction(callback)
    } else {
      let path = this.path

      debug("loading products file(%s)", path)

      logger.info(this, `loading products file(${path})`)

      io.loadFile(path)
      // 解析数组配置，每一项配置初始化一个product
        .then(batchMetadata =>
          utils.resolveIteratorValues(batchMetadata).forEach(this._addLazyProvider.bind(this))
        )
        .catch(error =>
          logger.error(this, `Unable to retrieves products caused by loading file{${path} failed`, error)
        )
        .finally(() =>
          (this.attached = true) && utils.handleIfFunction(callback)
        )
    }
  }

  /**
   * 通过product-options创建lazy provider
   * @param {Object} metadata
   * @private
   */
  _addLazyProvider(metadata) {
    const decorator = this.decorator()
    const providerHash = this.providerHash

    let id = decorator.idFromMetadata(metadata)
    let type = decorator.typeFromMetadata(metadata)

    let namespace = utils.normalizeNamespace(type, id)
    if (providerHash[namespace] != null) {
      // 首先处理此namespace下已存在的provider
      // 原则上，旧的优先
      logger.warn(this, `A product{${namespace}} is dropped caused by existed`)
    } else {
      logger.info(this, `Load a piece of metadata(${namespace})`)

      providerHash[namespace] = { metadata }

      // set index for query
      const providerIndex = this.providerIndex;
      (providerIndex.id[id] || (providerIndex.id[id] = Array.of())).push(namespace)
      (providerIndex.type[type] || (providerIndex.type[type] = Array.of())).push(namespace)
    }
  }

  /**
   * lazy product
   * @see Servlet.prototype.supply
   */
  supply(type, id) {
    let productInfo = this.productInfo(type, id)

    return productInfo ? this.providerFactory().createProduct(productInfo) : null
  }

  /**
   * @see Servlet.prototype.supplyAll
   */
  supplyAll() {
    return this.allProductInfo().map(info => this.providerFactory().createProduct(info))
  }

  /**
   * @see Servlet.prototype.supplyById
   */
  supplyById(id) {
    return this.productInfoById(id).map(info => this.providerFactory().createProduct(info))
  }

  /**
   * @see Servlet.prototype.supplyByType
   */
  supplyByType(type) {
    return this.productInfoByType(type).map(info => this.providerFactory().createProduct(info))
  }

  /**
   * @Nullable
   * @see Servlet.prototype.productInfo
   */
  productInfo(type, id) {
    let productInfo = null
    if (type != null && id != null) {
      let namespace = utils.normalizeNamespace(type, id)

      productInfo = this._normalizeProductInfoIfNull(this.providerHash[namespace])
    }

    return productInfo
  }

  /**
   * @see Servlet.prototype.allProductInfo
   */
  allProductInfo() {
    return Object.values(this.providerHash).map(this._normalizeProductInfoIfNull.bind(this))
  }

  /**
   * @see Servlet.prototype.productInfoById
   */
  productInfoById(id) {
    let hits = this.providerIndex.id[id]

    return hits
      ? hits.map(namespace => this._normalizeProductInfoIfNull(this.providerHash[namespace]))
      : objects.EmptyArray
  }

  /**
   * @see Servlet.prototype.productInfoByType
   */
  productInfoByType(type) {
    let hits = this.providerIndex.type[type]

    return hits
      ? hits.map(namespace => this._normalizeProductInfoIfNull(this.providerHash[namespace]))
      : objects.EmptyArray
  }

  _normalizeProductInfoIfNull(providerItem) {
    return providerItem
      ? (providerItem.productInfo ||
          (providerItem.productInfo = this.decorator().normalizeProductInfo(providerItem.metadata, this)))
      // 说明加载metadata文件，没有此product
      : null
  }

  /**
   * for this implement, 可以获取的providers在{@see _attach}加载本地就已经决定了，
   * 不存在动态添加新的provider
   * @see Servlet.prototype.provide
   * @returns {Provider} 尝试返回一个attached的provider
   */
  provide(metadata, options) {
    // 输入的metadata不是实际provide的，实际的metadata已经通过文件加载
    // metadata以实际的文件内容为准
    // 这里输入的metadata，仅仅用于query
    // 特别地，如果provider已经存在，输入的options就会不用到
    let id = this.decorator().idFromMetadata(metadata)
    let type = this.decorator().typeFromMetadata(metadata)
    let namespace = utils.normalizeNamespace(id, type)

    let provider = utils.get('poison-provider')
    let providerItem = this.providerHash[namespace]

    // 首先，检查这个namespace的provider实例是否可用
    if (providerItem) {
      provider = this._createLazyIfNull(providerItem, options)

      // 其次，检查attached，若未attach，则尝试attach
      if (!provider.poison && !provider.attached) {
        // memory-servlet默认只支持初始化加载的product option
        // try to attach
        try {
          provider.attach()
        } catch (e) {
          logger.error(this, `Unable to attach the provider{${namespace}}`, e)
        }
      }
    } else if (provider.poison) {
      logger.error(this, `Unable to provide a service{${namespace}}`, TypeError("输入正确的id和type"))
    }

    logger.info(this, "providing a service: " + provider.detail())

    return provider
  }

  /**
   * @see Servlet.prototype.autoUpdateProductInfo
   */
  autoUpdateProductInfo() { /* do nothing */ }

  /**
   * @see Servlet.prototype.detail
   */
  detail() {
    return `${this.name}{ alive: ${this.alive}, attached: ${this.attached} }`
  }

  _createLazyIfNull(providerItem, provideOptions) {
    if (providerItem) {
      return providerItem.provider ||
        (providerItem.provider = this.providerFactory()
          // 创建provider需要两个参数：providerInfo 和 servlet
          .createLazy(this.decorator().normalizeProviderInfo(providerItem.metadata, this, provideOptions), this))
    }

    return null
  }
}

module.exports = MemoryServlet