const utils = require('../../core/utils')

describe('utils', () => {

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


  test('unSupportedHandler - for no implement function', () => {
    expect(utils.unSupportedHandler).toThrowError()
  })


  test('handleIfFunction - convenience call function', () => {
    let mockFunction = jest.fn(() => { console.log("hh") })

    utils.handleIfFunction(() => mockFunction())
    utils.handleIfFunction()

    expect(mockFunction.mock.calls.length).toBe(1)
  })

  test('validate* - type check', () => {
    expect(() => utils.validateConstructor("", Array, "ErrorType")).toThrowError(TypeError)
    expect(() => utils.validateNotNull(null, "ErrorType")).toThrowError(TypeError)
    expect(() => utils.validateString(undefined, "ErrorType")).toThrowError(TypeError)
  })
})