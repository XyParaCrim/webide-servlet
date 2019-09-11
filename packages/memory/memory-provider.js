/**
 * socket.io implement
 */
const Provider = require("../../core/provider")
const io = require("socket.io-client")

class MemoryProvider extends Provider {
  constructor (options) {
    super()
  }
}

module.exports = MemoryProvider