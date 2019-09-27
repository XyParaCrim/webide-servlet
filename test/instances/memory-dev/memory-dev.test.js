const WebideServlet = require('../../../index')
const MemoryServlet = require('../../../packages/servlet/memory/servlet')
const SocketIoProvider = require('../../../packages/provider-product/socket-io/provider')
const utils = require('../../../core/utils')
const objects = require('../../../core/objects')
const http = require('http')

describe('memory-dev', () => {
  // 测试加载memory-dev
  test('load memory-servlet instance of memory-dev', () => {
    //expect.assertions(2);

    return WebideServlet.load('memory-dev')
      .then(servlet => {
        /* 测试生产的实例是否正确 */

        expect(servlet).toBeInstanceOf(MemoryServlet)
        expect(servlet.attached).toBeTruthy()
        expect(servlet.alive).toBeTruthy()
        expect(servlet.serviceType).toBe(objects.DefaultServiceType)

        /* 测试Api */

        // like protected
        expect(servlet.providerFactory()).toBe(SocketIoProvider)

        // public api
        // 获取一个attached provider in provide's side //does not exist
        let notExistedProvider = servlet.provide({})
        expect(notExistedProvider).toBe(utils.get('poison-provider'))
        expect(notExistedProvider.poison).toBeTruthy()

        let metadata = { "id": "v2sual", "type": "v2sual" }
        let provideOptions = { server: http.createServer() }

        let existedProvider = servlet.provide(metadata, provideOptions)
        expect(existedProvider.poison).toBeFalsy()
        expect(existedProvider).toBeInstanceOf(SocketIoProvider)

        let allProductInfo = servlet.allProductInfo()

        expect(allProductInfo.length).toBe(3)
        expect(allProductInfo[0].metadata).not.toBeNull()

        let productInfoList = servlet.productInfoById('ad')
        expect(productInfoList).not.toBeNull()
        expect(productInfoList.length).toBe(1)

        existedProvider.close()
      })
  })
})

