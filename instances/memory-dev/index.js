const DEFAULT_PRODUCTS_FILE = "products.json"

module.exports = function (Servlet) {
  return new Servlet({
    cwd: __dirname,
    filename: DEFAULT_PRODUCTS_FILE
  })
}
