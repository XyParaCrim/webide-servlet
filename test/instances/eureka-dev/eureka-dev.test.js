const WebideServlet = require('../../../index')
const http = require('http')

describe('eureka-dev', () => {
  // 测试错误选项传入
  test('load eureka-servlet instance with unmatched options', () => {
    const unmatchedOptions = true
    return WebideServlet.load('eureka-dev', unmatchedOptions)
      .catch(e => expect(e.name).toMatch('TypeError'))
  })

  // 测试正确加载和初始化
  test('load eureka-servlet instance with right options', () => {
    const server = http.createServer()

    return WebideServlet.load('eureka-dev', { serviceType: 'test-service' })
      .then(servlet => {
        // 初始化eureka-client,且不会自动注册，也不自动拉去服务
        expect(servlet.attached).toBe(true)

        const options = { server }
        const metadata = {
          id: 'productId',
          type: 'productType',
          port: 8888,
          host: "localhost"
        }

        let provider = servlet.provide(metadata, options)

        expect(provider.id).toBe(provider.productInfo.providerId)
      })
  })
})