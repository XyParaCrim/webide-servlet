const MemoryServlet = require('../../packages/memory/memory-servlet')

module.exports = function createMemoryDev() {
  return new MemoryServlet()
}