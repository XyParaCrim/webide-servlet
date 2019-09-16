const WebideServlet = require('../../../index')
const MemoryServlet = require('../../../packages/memory/memory-servlet')
const utils = require('../../../core/utils')

describe('memory-dev', () => {

  // 测试加载servlet实例错误
  test('load memory-servlet instance fails with an error', () => {
    WebideServlet.load('memory-xxx')
      .catch(e => expect(e).toMatch('error'))
  })

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
        expect(servlet.providerFactory()).toBe(MemoryServlet.Provider)
        expect(servlet.productFactory()).toBe(MemoryServlet.Product)

        // public api
        // 获取一个attached provider in provide's side //does not exist
        let notExistedProvider = servlet.provide({})
        expect(notExistedProvider).toBe(utils.get('poison-provider'))
        expect(notExistedProvider.poison).toBeTruthy()

        let existedProvider = servlet.provide({ "id": "aaa", "type": "v1" })
        expect(existedProvider.poison).toBeFalsy()
        expect(existedProvider).toBeInstanceOf(MemoryServlet.Provider)

        existedProvider.close()
      })
  })
})

