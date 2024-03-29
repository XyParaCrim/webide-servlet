const Product = require('../../../core/product')
const io = require('socket.io-client')
const utils = require('../../../core/utils')
const socketOptions = require('./socket.io-client.json')

// product的元事件
// 对于通讯事件的黑名单，这些事件只相对于Product本身
const events = new Set([
  'before_emit',
  'after_emit',
  'req_success',
  'req_error',
  'req_timeout',
  'req_unknown'
])

const DEFAULT_OPTIONS = {
  timeout: 10000
}

const poison = new Product()

poison.emit = function () {
  return Promise.reject(Error('This product does not exist'))
}

class SocketIoProduct extends Product {
  /**
   * @see Product.create
   */
  static create(productInfo) {
    return new SocketIoProduct(productInfo)
  }

  static poison() {
    return poison
  }

  constructor(productInfo) {
    super(productInfo)
    this.poison = false
  }

  get attached () {
    return this.client != null
  }

  /**
   * // TODO 怎么表示连接超时的情况
   * @see Product.attach
   */
  attach(callback) {
    const client = this.client
    if (client) {
      // 说明之前就已经创建过了
      if (client.connected) {
        // 如果本身就连接，那么就直接调用callback
        utils.handleIfFunction(callback)
      } else {
        // 注册callback，尝试连接
        this.client.once('connect', () => utils.handleIfFunction(callback))
        client.connect()
      }
    } else {
      // 创建socket-io客户端
      this.client = this._createClient()
      this.client.once('connect', () => utils.handleIfFunction(callback))
    }
  }

  _createClient() {
    return io(this.url, Object.assign({}, socketOptions, { path: this.path + socketOptions.path }))
  }

  emit(event, data, options) {
    if (events.has(event)) {
      // 触发事件的黑名单
      // 这里不会返回thenable
      return super.emit.apply(this, arguments)
    }

    // 这里是发送事件
    if (this.attached) {
      let emitOptions = this._normalizeOptions(options)
      let requestData = this._normalizeReqData(event, data, emitOptions)

      this.emit('before_emit', event, emitOptions)

      return this.request(requestData)
    } else {
      // 这里表示attached后，再resolve事件的结果
      return new Promise(resolve =>
        this.attach(() =>
          resolve(this.emit(event, data, options))
        )
      )
    }
  }

  _normalizeOptions(options) {
    options = options || {}

    if (isNaN(options.timeout = Number(options.timeout)) || options.timeout < 0) {
      options.timeout = DEFAULT_OPTIONS.timeout
    }

    return options
  }

  _normalizeReqData(event, data, options) {
    return {
      id: utils.generateId(),
      data: data || {},
      event,
      type: this.type,
      time: new Date().getTime(),
      timeout: options.timeout
    }
  }

  request(requestData) {
    return new Promise((resolve, reject) => {
      let client = this.client
      let { type, event, timeout } = requestData


      client.emit(type, requestData, utils.createExpiredFunction(
        // timeout 之前触发
        response => {
          if (response.state === 'success') {
            resolve(response)
            this.emit('req_success', event, response)
          } else if (response.state === 'error') {
            reject(response)
            this.emit('req_error', event, response)
          } else {
            console.error(`dont support response state : ${response.state}, eventId : ${event}`)
            this.emit('req_unknown', event, response)
          }

          this.emit('after_emit', event, response)
        },

        // timeout后，若上面的函数没有调用，则触发
        () => {
          let response = { state: 'error', errorMsg: '请求返回超时 :' + event }

          reject(response)
          this.emit('req_error', event, response)
          this.emit('req_timeout', event)
          this.emit('after_emit', event, response)
        },

        // 有效事件
        timeout
      ))
    })
  }

  get(key) {
    return this.metadata[key]
  }

  on(event) {
    if (events.has(event)) {
      super.on.apply(this, arguments)
    } else if (this.attacted) {
      this.client.on.apply(this.client, arguments)
    }
  }
}

module.exports = SocketIoProduct
