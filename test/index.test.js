const WebideServlet = require('../index')

describe('test WebideServlet.load', () => {
  // 测试加载servlet实例错误
  test('load memory-servlet instance fails with an error', () => {
    WebideServlet.load('memory-xxx')
      .catch(e => expect(e.name).toMatch('Error'))
  })

  // 测试instances存在，但是instance.json中的option错误
  test('load error instance fails with an error', () => {
    WebideServlet.load('error')
      .catch(e => expect(e.name).toMatch('Error'))
  })
})

describe("test WebideServlet.resolveProductFactoryPath", () => {

  // 测试error packet的路径
  test('get error\'s package path fails with an error', () => {
    return WebideServlet.resolveProductFactoryPath('error')
      .catch(e => expect(e.name).toMatch('Error'))
  })

  test('get class of memory\'s product', () => {
    const path = require('path')
    return WebideServlet.resolveProductFactoryPath('memory-dev')
      .then(productPath => {
        // 返回的路径和Product class
        expect(productPath).toBe(path.resolve(__dirname, '../packages/memory/product.js'))
        expect(require(productPath)).toBe(require('../packages/memory/product'))
      })
  })
})