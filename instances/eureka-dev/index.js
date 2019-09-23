/**
 * 1.默认加载此文件夹下的eureka-client.yml
 * 2.默认不自动注册到eureka（registerWithEureka = false）
 * 3.默认不自动拉去注册信息（fetchRegistry = false）
 */
module.exports = function (Servlet) {
  return new Servlet({
    cwd: __dirname,
    logger: {
      error: console.error(),
      warn: console.warn,
      info: console.log,
      debug: console.log,
    }
  })
}