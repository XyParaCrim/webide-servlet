const Product = require('../../core/product')

class MemoryProduct extends Product {
  static create(provider) {

  }

  constructor(provider) {
    super(provider)

    this.poison = false
  }

  attach() {
    
  }
}

module.exports = MemoryProduct
