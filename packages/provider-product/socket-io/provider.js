/**
 * socket.io implementation
 */
const Provider = require("../../../core/provider")
const SocketIoProduct = require('./product')
const io = require("socket.io")
const debug = require('debug')('webide-servlet:memory-provider')
const logger = require('../../../core/logger')
const socketOptions = require('./socket.io-server.json')


function normalizeReqData(reqData, provider) {
  reqData.id = reqData.id || provider.io.engine.generateId()
  reqData.callbackId = reqData.id
  reqData.timeout = 5000
}

class SocketIoProvider extends Provider {

  /**
   * @see core/provider$create
   */
  static create(options, servlet) {
    let provider = new SocketIoProvider(options, servlet)
    provider.attach()
    return provider
  }

  /**
   * @see core/provider$createLazy
   */
  static createLazy(options, servlet) {
    return new SocketIoProvider(options, servlet)
  }

  static createProduct(info) {
    return SocketIoProduct(info)
  }

  constructor (options, servlet) {
    super(servlet)
    this.name = "memory-provider"
    this.alive = true // always true
    this.poison = false
    this.options = options
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
      const decorator = this.decorator
      const options = this.options

      let port = decorator.port(options)
      let server = io(port, socketOptions)

      debug('starting socket-io server(%s)', port)
      logger.info(this, `attaching socket-io server(${port})...`)

      // TODO 不是有效绑定
      this.server = server
      this.alive = this.attached = true

      // 此事件挂在namespace上，namespace只有一个connection事件
      server.on('connection', this._onConnect)

      logger.info(this, "start socket.io server: " + port)
    }
  }

  supply() {
    return SocketIoProvider.createProduct(this.decorator.normalize(this.options))
  }

  /**
   * 关闭socket-io
   */
  close() {
    if (this.attached && this.server) {
      let port = this.decorator.port(this.options)

      logger.info(this, `closing socket-io server(${port})...`)
      this.server.close(() => {
        logger.info(this, `closed socket-io server(${port})...`)
      })
    }
  }

  metadata() {
    return this.decorator.metadata(this.options)
  }

  productInfo() {
    return this.decorator.normalize(this.options)
  }

  /**
   * @see Provider.set
   */
  set(key, value) {
    if (arguments.length === 1 && typeof key === 'object') {
      for (let [k, v] of Object.entries(key)) {
        this.set(k, v)
      }
    } else if(arguments.length === 2) {
      const metadata = this.metadata()
      metadata[key] = value
    }
  }

  /**
   * socket-io event(这里的实现和webide一摸一样)
   * @param socket
   * @private
   */
  _onConnect(socket) {
    debug('a socket(%s) is connected, binding events', socket.id)

    const decorator = this.decorator
    const options = this.options

    let type = decorator.type(options)

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
      let callbackCount = this.listenerCount(event)

      logger.info(this, `[left: ${timeout}]receive a event(${event}), pending callback(${callbackId}), registered callback count(${callbackCount})`)

      if (callbackCount > 0) {
        // 沿用webide实现，所以显得部分事件分发显得多余
        // 不使用once，是因为可能同一事件可能注册多个function
        debug('register callback(%s)', event + '#' + callback)
        this.on(callbackId, callback)
        this.emit(event, reqData)

        // timeout，统一注销此次callback
        setTimeout(() => {
          this.off(callbackId, callback)
          logger.info(this, `timeout(${event}#${callbackId}), unregister callback`)
          debug('unregister callback(%s)', event + '#' + callback)
        }, timeout)
      } else {
        logger.info(this, `在服务端未注册事件(${event}#${callbackId})`)
        // 如果没有此event事件则被当作此次通信错误
        callback({
          state: 'error',
          errorMsg: `未找到${event}事件`
        })
      }
    })
  }

  detail() {
    return `${this.name}{ port: ${this.decorator.port(this.options)}, namespace: ${this.decorator.namespace(this.options)}, attached: ${this.attached} }`
  }
}

// TODO
SocketIoProvider.createProduct = function (info) {
  return SocketIoProduct.create(info)
}

module.exports = SocketIoProvider
