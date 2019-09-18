const Product = require('../../core/product')
const io = require('socket.io-client')
const utils = require('../../core/utils')

// product的元事件
// 对于通讯事件的黑名单，这些事件只相对于Product本身
const events = new Set([
  'before_emit',
  'after_emit',
  'req_success',
  'req_error'
])

const DEFAULT_OPTIONS = {
  timeout: 10000
}

const DefaultParser = {
  url(metadata) {
    return metadata.url
  },
  socketOptions(metadata) {
    return metadata['socket.io-client']
  },
  type(metadata) {
    return metadata.type
  }
}

const poison = new Product()

poison.emit = function () {
  return Promise.reject(Error('This product does not exist'))
}

class MemoryProduct extends Product {
  /**
   * @see Product.create
   */
  static create(metadata) {
    return new MemoryProduct(metadata)
  }

  /**
   * @see Product.parser
   */
  static parser() {
    return DefaultParser
  }

  static poison() {
    return poison
  }

  constructor(metadata) {
    super(metadata)
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
      const parser = MemoryProduct.parser()
      const metadata = this.metadata

      let url = parser.url(metadata)
      let socketOptions = parser.socketOptions(metadata)

      this.client = io(url, socketOptions)
      this.client.once('connect', () => utils.handleIfFunction(callback))
    }
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
      let requestData = this.__normalizeReqData(event, data, emitOptions)

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

  __normalizeReqData(event, data, options) {
    return {
      id: utils.generateId(),
      data: data || {},
      event,
      type: MemoryProduct.parser().type(this.metadata),
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
            console.error(`dont support response state : ${response.state},eventId : ${event}`)
          }
        },

        // timeout后，若上面的函数没有调用，则触发
        () => {
          let response = { state: 'error', errorMsg: '请求返回超时 :' + event }

          reject(response)
          this.emit('req_error', event, response)
          this.emit('after_emit', event, response)
        },

        // 有效事件
        timeout
      ))
    })
  }

  on(event) {
    if (this.attacted) {
      events.has(event) ? super.on.apply(this, arguments) : this.client.on.apply(this.client, arguments)
    }
  }
}

module.exports = MemoryProduct
