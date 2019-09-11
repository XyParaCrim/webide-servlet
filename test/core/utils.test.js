const utils = require('../../core/utils')
const path = require('path')

describe('utils', () => {

  test('loadFile - load json file', () => {
    const loadFile = utils.loadFile

    // 测试test/resources/products.json文件，简单测试数组长度等
    return loadFile(path.resolve(__dirname, '../resources/products.json'))
      .then(jsonContent => {
        expect(jsonContent).not.toBeNull()
        expect(jsonContent).toBeInstanceOf(Array)
        expect(jsonContent).toHaveLength(2)
      })
  })
})