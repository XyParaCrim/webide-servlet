const Product = require('../../core/product')
const EventEmitter = require('events').EventEmitter
const io = require('socket.io-client')
const utils = require('../../core/utils')

const events = new Set([
  'before_emit',
  'after_emit',
  'req_success',
  'req_error',
  'add_handler_queue'
])

function invokeSelfHandler (emitter, args) {
  EventEmitter.prototype.emit.apply(emitter, args)
}

function toRequest(event, data, options) {
  return {
    id: utils.generateId(),
    data: data || {},
    event,
    type: options.type,
    time: new Date().getTime(),
    timeout: options.timeout
  }
}

function flushUnHandlers(handlers) {
  let copies = handlers.slice(0)
  handlers.length = 0
  for (let handler of copies) {
    handler()
  }
}

function checkTimeout(options, defaultValue) {
  (isNaN(options.timeout = Number(options.timeout)) || options.timeout < 0) && (options.timeout = defaultValue)
}


class MemoryProduct extends Product {
  static create(metadata) {
    return new MemoryProduct(metadata)
  }

  constructor(metadata) {
    super(metadata)
    this.poison = false
    this.unHandlers = Array.of()
  }

  attach() {
    if (!this.client) {
      const metadata = this.metadata

      let url = metadata['ip']
      let socketOptions = metadata['socket.io-client']

      // create client
      this.client = io(url, socketOptions)
      this.attacted = true

      this.client.on('connect', () => flushUnHandlers(this.unHandlers))
      this.client.on('connect', () => console.log('连接成功'))
    }
  }

  emit(event, data, options) {
    if (this.attacted && this.client.connected) {

      checkTimeout(options, 5000)

      invokeSelfHandler(this, ['before_emit', event, options])

      return this._emitWithTimeoutHandling(event, data, options)
    }

    return new Promise(resolve => {
      invokeSelfHandler(this, ['add_handler_queue', event, options])
      this.unHandlers.push(() => this.emit(event, data, options).then(data => resolve(data)).catch(e=>{console.log(e)}))
    })
  }

  _emitWithTimeoutHandling(event, data, options) {
    let socket = this.client
    let finish = true
    let isTimeout = false
    let request = toRequest(event, data, options)

    return new Promise((resolve, reject) => {
      socket.emit(request.type, request, result => {
        finish = true

        if (!isTimeout) {
          if (result.state === 'success') {
            resolve(result)
            invokeSelfHandler(socket, Array.of('req_success', {
              event: request.event,
              data: result
            }))
          } else if (result.state === 'error') {
            reject(result)
            invokeSelfHandler(socket, Array.of('req_error', {
              event: request.event,
              data: result
            }))
          } else {
            console.error(`dont support response state : ${result.state},eventId : ${request.event}`)
          }

          invokeSelfHandler(socket, Array.of('after_emit'))
        }

        setTimeout(() => {
          if (!finish) {
            isTimeout = true

            let errMsg = {
              state: 'error',
              errorMsg: '请求返回超时 :' + event
            }

            reject(errMsg)

            invokeSelfHandler(socket, Array.of('req_error', {
              event,
              data: errMsg
            }))
            invokeSelfHandler(socket, Array.of('after_emit'))
          }
        }, options.timeout)

      })
    })
  }

  on(event) {
    if (this.attacted) {
      events.has(event) ? super.on.apply(this, arguments) : this.client.on.apply(this.client, arguments)
    }
  }
}

module.exports = MemoryProduct
