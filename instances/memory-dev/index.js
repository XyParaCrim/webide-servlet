const decorator = require('./decorator')
const path = require('path')
const utils = require('../../core/utils')

const DEFAULT_PRODUCTS_FILE = "products.json"

module.exports = function (Servlet, options) {

  // product文件位置
  options.cwd = options.cwd || __dirname
  options.filename = options.filename || DEFAULT_PRODUCTS_FILE
  options.path = options.path || path.resolve(options.cwd, options.filename)

  utils.validateString(options.path, "缺少文件路径(options.path or options.cwd + options.filename)")

  return new Servlet(decorator, options)
}
