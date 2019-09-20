/**
 * Simply Logger
 */

const out = {
  info: console.log,

  warn: console.warn,

  error: console.error
}


module.exports = {
  info(instance, message) {
    out.info(instance.detail() + ' - ' + message)
  },

  warn (instance, message) {
    out.warn(instance.detail() + ' - ' + message)
  },

  error(instance, message, error, doThrow) {
    out.error(instance.detail() + ' - ' + message)

    // 输入error则log，添加可以rethrow的选项
    if (error) {
      out.error(error)

      if (doThrow) {
        throw error
      }
    }
  },

  out(object) {
    if (object) {
      typeof object.info === 'function' && (out.info = info)
      typeof object.warn === 'function' && (out.info = warn)
      typeof object.error === 'function' && (out.info = error)
    }
  }
}