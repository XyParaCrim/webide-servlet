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

  test('get and set - store global variable', () => {

    // 简单测试
    expect(utils.get).toBeInstanceOf(Function)
    expect(utils.set).toBeInstanceOf(Function)

    // 一致性
    let temp = {}

    utils.set(temp, temp)
    expect(utils.get(temp)).toBe(temp)
  })

  test('generateId - generate uniqueness id', () => {
    // uniqueness
    expect(utils.generateId()).not.toBe(utils.generateId())
  })


})