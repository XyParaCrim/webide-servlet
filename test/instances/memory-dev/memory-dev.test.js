const WebideServlet = require('../../../index')
const MemoryServlet = require('../../../instances/memory-dev/index')

describe('memory-dev', () => {

  // 测试加载servlet实例错误
  test('load memory-servlet instance fails with an error', () => {
    WebideServlet.load('memory-xxx')
      .catch(e => expect(e).toMatch('error'))
  })

  // 测试加载memory-dev
  test('load memory-servlet instance of memory-dev', () => {
    WebideServlet.load('memory-dev')
      .then(servlet => {
        // 测试生产的实例是否正确
        expect(servlet).toBeInstanceOf(MemoryServlet)
        expect(servlet.alive).toBeTruthy()

        // 测试Api


      })
      .catch(e =>
        // 不期望抛出错误
        expect(e).toBeUndefined()
      )
  })
})

