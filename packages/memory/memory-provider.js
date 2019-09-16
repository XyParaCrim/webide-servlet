/**
 * socket.io implementation
 */
const Provider = require("../../core/provider")
const MemoryProduct = require('./memory-product')
const io = require("socket.io")
const Debug = require('debug')

const debug = Debug('webide-servlet:memory-provider')
const DefaultParser = {
  id: function (productOptions) {
    return productOptions.id
  },
  type(productOptions) {
    return productOptions.type
  },
  port(options) {
    return options.port
  },
  namespace(options) {
    return options.id + '#' + options.type
  },
  socketOptions(options) {
    return options['socket.io']
  },
  metadata(options) {
    return options['client']
  },
  simpleCheckProductOptions() {}
}

function normalizeReqData(reqData, provider) {
  reqData.id = reqData.id || provider.io.engine.generateId()
  reqData.callbackId = reqData.id
  reqData.timeout = 5000
}

class MemoryProvider extends Provider {

  /**
   * @see core/provider$create
   */
  static create(options) {
    let provider = new MemoryProvider(options)
    provider.attach()
    return provider
  }

  /**
   * @see core/provider$createLazy
   */
  static createLazy(options) {
    return new MemoryProvider(options)
  }

  /**
   * @see core/provider$parser
   */
  static parser() {
    return DefaultParser
  }

  constructor (options) {
    super()
    this.alive = true // always true
    this.poison = false
    this.options = options
    this.server = null
    // this.parser = this.constructor.parser()
    this._setUp()
  }

  /**
   * 将一些事件方法绑上下文
   * @private
   */
  _setUp() {
    this._onConnect = this._onConnect.bind(this)
  }

  /**
   * @see Provider.attach
   */
  attach() {
    if (!this.attached) {
      const parser = MemoryProvider.parser()
      const options = this.options

      let port = parser.port(options)
      let optionsOfSocketIO = parser.socketOptions(options)
      let server = io(port, optionsOfSocketIO)

      debug('starting socket-io server(%s)', port)

      // TODO 不是有效绑定
      this.server = server
      this.alive = this.attached = true

      // 此事件挂在namespace上，namespace只有一个connection事件
      server.on('connection', this._onConnect)
    }
  }

  /**
   * 关闭socket-io
   */
  close() {
    if (this.attached && this.server) {
      this.server.close()
    }
  }

  metadata() {
    return MemoryProvider.parser().metadata(this.options)
  }

  /**
   * socket-io event(这里的实现和webide一摸一样)
   * @param socket
   * @private
   */
  _onConnect(socket) {
    debug('a socket(%s) is connected, binding events', socket.id)

    const parser = MemoryProvider.parser()
    const options = this.options

    let type = parser.type(options)

    // socket-io中socket对象默认事件
    socket.on('disconnect', reason => console.log(`断开连接: { socket-id: ${socket.id}, reason: ${reason}}`))
    socket.on('error', error => console.error(`发生错误: { socket-id: ${socket.id}, error: ${error}}`))
    socket.on('disconnecting', reason => console.log(`正在断开连接中: { socket-id: ${socket.id}, reason: ${reason}}`))

    // 主要交互事件
    socket.on(type, (reqData, callback) => {
      normalizeReqData(reqData)

      let event = reqData.event
      let timeout = reqData.timeout
      let callbackId = reqData.callbackId
      if (this.listenerCount(event) > 0) {
        // 沿用webide实现，所以显得部分事件分发显得多余
        // 不使用once，是因为可能同一事件可能注册多个function
        debug('register callback(%s)', event + '#' + callback)
        this.on(callbackId, callback)
        this.emit(event, reqData)

        // timeout，统一注销此次callback
        setTimeout(() => {
          this.off(callbackId, callback)
          debug('unregister callback(%s)', event + '#' + callback)
        }, timeout)
      } else {
        // 如果没有此event事件则被当作此次通信错误
        callback({
          state: 'error',
          errorMsg: `未找到${event}事件`
        })
      }
    })
  }
}

// socket-io.client实现
MemoryProvider.Product = MemoryProduct

module.exports = MemoryProvider