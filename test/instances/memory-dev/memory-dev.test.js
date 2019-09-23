const WebideServlet = require('../../../index')
const MemoryServlet = require('../../../packages/servlet/memory/servlet')
const SocketIoProvider = require('../../../packages/provider-product/socket-io/provider')
const utils = require('../../../core/utils')

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

        /* 测试Api */

        // like protected
        expect(servlet.providerFactory()).toBe(SocketIoProvider)

        // public api
        // 获取一个attached provider in provide's side //does not exist
        let notExistedProvider = servlet.provide({})
        expect(notExistedProvider).toBe(utils.get('poison-provider'))
        expect(notExistedProvider.poison).toBeTruthy()

        let existedProvider = servlet.provide({ "id": "vda", "type": "v2sual" })
        expect(existedProvider.poison).toBeFalsy()
        expect(existedProvider).toBeInstanceOf(SocketIoProvider)

        // 测试 provider metadata
        let metadata = existedProvider.metadata()
        expect(metadata).not.toBeNull()
        expect(metadata.url).toBe("http://localhost:9595")

        existedProvider.close()
      })
  })
})

