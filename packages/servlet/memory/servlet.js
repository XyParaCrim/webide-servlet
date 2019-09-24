const Servlet = require('../../../core/servlet')
const utils = require('../../../core/utils')
const io = require('../../../core/io')
const path = require('path')
const logger = require('../../../core/logger')
const debug = require('debug')('webide-servlet:memory-servlet')

const defaultParser = {
  path(options) {
    return path.resolve(options.cwd, options.filename)
  }
}

class MemoryServlet extends Servlet {
  constructor(options, decorator) {
    super(decorator)

    this.name = "memory-servlet"
    this.alive = true // always true
    this.options = options
    this.providerMap = {}
    this.providers = []
  }

  /**
   * 默认只是加载本地配置文件
   * @param afterAttached
   */
  attach (afterAttached) {
    if (this.attached) {
      utils.handleIfFunction(afterAttached)
    } else {
      const options = this.options

      let path = defaultParser.path(options)

      debug("loading products file(%s)", path)

      logger.info(this, `loading products file(${path})`)

      io.loadFile(path)
      // 解析数组配置，每一项配置初始化一个product
        .then(productConfig =>
          utils.resolveIteratorValues(productConfig).forEach(options => this._addLazyProvider(options))
        )
        .catch(error =>
          logger.error(this, `Unable to retrieves products caused by loading file{${path} failed`, error)
        )
        .finally(() =>
          (this.attached = true) && utils.handleIfFunction(afterAttached)
        )
    }
  }

  /**
   * 通过product-options创建lazy provider
   * @param {Object} productOptions
   * @private
   */
  _addLazyProvider(productOptions) {
    const providerDecorator = this.decorator()
    const providerFactory = this.providerFactory()
    const providerMap = this.providerMap

    let namespace = providerDecorator.namespace(productOptions)
    let provider = providerMap[namespace]
    if (provider && provider.alive) {
      // 首先处理此namespace下已存在的provider
      // 原则上，如果alive，则旧的优先，反之，则旧的优先
      logger.warn(this, `A product{${namespace}} is dropped caused by existed`)
    } else {
      // un-alive -> replace
      debug('creating lazy provider(%s)', namespace)
      logger.info(this, `creating lazy provider(${namespace})`)

      provider = providerFactory.createLazy(productOptions, this)

      // check 这个返回的provider是否完好无损的，若是poison则drop it, 维持原provider options
      if (provider.poison) {
        debug('creating lazy provider(%s) failed', namespace)
        logger.warn(this, `creating lazy provider(${namespace}) failed`)
      } else {
        debug('creating lazy provider(%s) done', namespace)
        logger.info(this, `creating lazy provider(${namespace}) done`)
        providerMap[namespace] = provider // TODO
        this.providers.push(provider)
      }
    }
  }

  supply(filterOptions) {
    return this.getProvider(filterOptions).supply()
  }

  metadata(filterOptions) {
    return this.getProvider(filterOptions).metadata()
  }

  getProductInfo(type) {
    // 返回所有metadata
    if (arguments.length === 0) {
      return this.providers.map(product => product.metadata())
    }
  }

  // TODO 严重
  getProvider(filterOptions) {
    if (typeof filterOptions === 'object') {
      const providerMap = this.providerMap
      const providerDecorator = this.decorator()

      let provider, namespace

      provider = providerMap[namespace = providerDecorator.namespace(filterOptions)] || utils.get('poison-provider')

      provider.poison && logger.error(this, `Unable to query{${namespace}} provider with no-matched options`)

      return provider
    } else {
      for (let provider of this.providers) {
        // TODO
        if (provider.options.id === filterOptions) {
          return provider
        }
      }
    }

    logger.error(this, "Unable to find a matched provider, and return poison-provider" , TypeError(filterOptions))

    return utils.get('poison-provider')
  }

  /**
   * for this implement, 可以获取的providers在{@see _attach}加载本地就已经决定了，
   * 不存在动态添加新的provider
   * @param options
   * @returns {Servlet.Provider} 尝试返回一个attached的provider
   */
  provide(options) {
    const providerMap = this.providerMap
    const providerDecorator = this.decorator()

    let namespace = providerDecorator.namespace(options)
    let provider = providerMap[namespace] || utils.get('poison-provider')

    // 首先，检查这个namespace的provider实例是否可用
    // 其次，检查attached，若未attach，则尝试attach
    if (!provider.poison && !provider.attached) {
      // memory-servlet默认只支持初始化加载的product option
      // try to attach
      try {
        provider.attach()
      } catch (e) {
        logger.error(this, `Unable to attach the provider{${namespace}}`, e)
      }
    } else if (provider.poison) {
      logger.error(this, `Unable to provide a service{${namespace}}`, TypeError("输入正确的id和type"))
    }

    logger.info(this, "providing a service: " + provider.detail())

    return provider
  }

  detail() {
    return `${this.name}{ alive: ${this.alive}, attached: ${this.attached} }`
  }
}

module.exports = MemoryServlet