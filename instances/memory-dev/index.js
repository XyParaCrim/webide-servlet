const MemoryServlet = require('../../packages/memory/memory-servlet')
const DEFAULT_PRODUCTS_FILE = "products.json"

module.exports = function createMemoryDev() {
  return new MemoryServlet({
    cwd: __dirname,
    filename: DEFAULT_PRODUCTS_FILE
  })
}