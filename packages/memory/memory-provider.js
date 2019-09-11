/**
 * socket.io implementation
 */
const Provider = require("../../core/provider")
const io = require("socket.io")
const Debug = require('debug')

const debug = Debug('webide-servlet:memory-provider')
const DefaultParser = {
  port(options) {
    return options.port
  },
  socketOptions(options) {
    return options.socketIO
  },
  id(productOptions) {
    return productOptions.id
  },
  type(productOptions) {
    return productOptions.type
  },
  simpleCheckProductOptions() {}
}

function normalizeReqData(reqData, provider) {
  reqData.id = reqData.id || provider.io.engine.generateId()
  reqData.callbackId = reqData.id
  reqData.timeout = 5000
}

class MemoryProvider extends Provider {

  static create(options) {
    let provider = new MemoryProvider(options)
    provider._start()
    return provider
  }

  constructor (options) {
    super()
    this.options = options
    this.parser = DefaultParser
    this._setUp()
  }

  _setUp() {
    this._onConnect = this._onConnect.bind(this)
  }

  _start() {
    const options = this.options
    const parser = this.parser

    let port = parser.port(options)
    let optionsOfSocketIO = parser.socketOptions(options)
    let server = io(port, optionsOfSocketIO)

    debug('starting socket-io server(%s)', port)

    // TODO 不是有效绑定
    this.alive = this.io.connected

    // 此事件挂在namespace上，namespace只有一个connection事件
    server.on('connection', this._onConnect)
  }

  /**
   * socket-io event(这里的实现和webide一摸一样)
   * @param socket
   * @private
   */
  _onConnect(socket) {
    debug('a socket(%s) is connected, binding events', socket.id)

    const options = this.options
    const parser = this.parser

    let type = parser.type(options)

    // socket-io中socket对象默认事件
    socket.on('disconnect', reason => console.log(`断开连接: { socket-id: ${socket.id}, reason: ${reason}}`))
    socket.on('error', error => console.error(`发生错误: { socket-id: ${socket.id}, error: ${error}}`))
    socket.on('disconnecting', reason => console.log(`正在断开连接中: { socket-id: ${socket.id}, reason: ${reason}}`))

    // 主要交互事件
    socket.on(type, (reqData, callback) => {
      normalizeReqData(reqData)

      let event = reqData.event
      let callbackId = reqData.callbackId
      if (this.listenerCount(event) > 0) {
        // 沿用webide实现，所以显得部分事件分发显得多余
        // 不使用once，是因为可能同一事件可能注册多个function
        debug('register callback(%s)', event + '#' + callback)
        this.on(callbackId, callback)
        this.emit(event, reqData)

        // timeout，统一注销此次callback
        setTimeout(() => {
          this.off(reqData.callbackId, callback)
          debug('unregister callback(%s)', event + '#' + callback)
        })
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

module.exports = MemoryProvider