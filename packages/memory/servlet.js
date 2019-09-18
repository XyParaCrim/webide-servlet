const Servlet = require('../../core/servlet')
const MemoryProvider = require('./provider')
const utils = require('../../core/utils')
const io = require('../../core/io')
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
      const parser = this.parser

      let path = parser.path(options)

      debug("loading products file(%s)", path)

      io.loadFile(path)
      // 解析数组配置，每一项配置初始化一个product
        .then(productConfig =>
          utils.resolveIteratorValues(productConfig).forEach(options => this._addLazyProvider(options))
        )
        .catch(error =>
          utils.handleServletError(this, error, `Unable to retrieves products caused by loading file{${path} failed`)
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

  // TODO
  batchMetadata(type) {
    // 返回所有metadata
    if (arguments.length === 0) {
      return this.providers.map(product => product.metadata())
    }
  }

  getProvider(filterOptions) {
    const providerMap = this.providerMap
    const providerParser = this.providerFactory().parser()

    let provider, namespace

    provider = providerMap[namespace = providerParser.namespace(filterOptions)] || utils.get('poison-provider')

    provider.poison && utils.handleServletError(this, new TypeError(`Unable to query{${namespace}} provider with no-matched options`))

    return provider
  }

  /**
   * for this implement, 可以获取的providers在{@see _attach}加载本地就已经决定了，
   * 不存在动态添加新的provider
   * @param options
   * @returns {Servlet.Provider} 尝试返回一个attached的provider
   */
  provide(options) {
    const providerMap = this.providerMap
    const providerParser = this.providerFactory().parser()

    let namespace = providerParser.namespace(options)
    let provider = providerMap[namespace] || utils.get('poison-provider')

    // 首先，检查这个namespace的provider实例是否可用
    // 其次，检查attached，若未attach，则尝试attach
    if (!provider.poison && !provider.attached) {
      // memory-servlet默认只支持初始化加载的product option
      // try to attach
      try {
        provider.attach()
      } catch (e) {
        utils.handleServletError(this, e, `Unable to attach the provider{${namespace}}`)
      }
    }

    return provider
  }
}

MemoryServlet.Provider = MemoryProvider

module.exports = MemoryServlet