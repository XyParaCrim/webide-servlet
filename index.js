const io = require('./core/io')
const Servlet = require('./core/servlet')
const logger = require('./core/logger')

const INSTANCES_DIR = io.resolve(__dirname, './instances/')
const SERVLET_DIR = io.resolve(__dirname, './packages/servlet')
const PROVIDER_PRODUCT_DIR = io.resolve(__dirname, './packages/provider-product')

const INDEX_FILE_NAME = 'index'
const INSTANCE_JSON_NAME = 'instance'

module.exports = {
  /**
   * 输入实例名称获取不同的servlet实例
   * @param instanceName 即/instances/${instanceName}
   * @param options 绑在servlet对象上的属性值
   * @returns {Promise<Servlet>}
   */
  load(instanceName, options) {
    // resolve 创建函数路径
    const instanceDir = io.resolve(INSTANCES_DIR, instanceName)
    const checkInstancesJson = io.checkFile(instanceDir, INSTANCE_JSON_NAME, 'json')
    const checkCreateServlet = io.checkFile(instanceDir, INDEX_FILE_NAME, 'js')

    // 检查instance.json 和 index.js 是否存在
    return Promise.all([checkInstancesJson, checkCreateServlet])
      .then(([instanceJsonPath, createServletPath]) => {
        const instanceOptions = require(instanceJsonPath)
        const createServlet = require(createServletPath)

        // 尝试去检查package/${packageName}/servlet.js文件
        let servletName = instanceOptions['servlet']
        let providerName = instanceOptions['provide-product']
        let servletClassDir = io.resolveFile(SERVLET_DIR, servletName)
        let providerClassDir = io.resolveFile(PROVIDER_PRODUCT_DIR, providerName)

        return Promise.all([
          io.checkFile(servletClassDir, 'servlet', 'js'),
          io.checkFile(providerClassDir, 'provider', 'js')
        ]).then(([servletPath, providerPath]) => {
          // 创建一个servlet实例
          let servlet = createServlet(require(servletPath), options)
          if (!servlet instanceof Servlet) {
            throw Error(`Failed to create the servlet{ ${servletName}: ${servletPath} }`)
          }

          let ProviderFactory = require(providerPath)
          if (!ProviderFactory) {
            throw Error(`Failed to load the provider-factory{ ${providerName}: ${providerPath} }`)
          }

          // 设置provider-factory
          servlet.providerFactory(ProviderFactory)

          // try attach and resolve it
          return new Promise(resolve => servlet.attach(() => resolve(servlet)))
        })
      })
  },
  /**
   * 设置自定义logger，默认为console
   * @param newLogger 需要有info、warn、error的方法
   */
  logger(newLogger) {
    logger.out(newLogger)
  },
  /**
   * 输入实例名称获取product class文件路径
   * @param instanceName
   * @returns {Promise<String>}
   */
  resolveProductFactoryPath(instanceName) {
    // resolve 创建函数路径
    const instanceDir = io.resolve(INSTANCES_DIR, instanceName)

    return io.checkFile(instanceDir, INSTANCE_JSON_NAME, 'json')
      .then(path => {
        let instanceOptions = require(path)
        let providerName = instanceOptions['provide-product']
        let providerClassDir = io.resolveFile(PROVIDER_PRODUCT_DIR, providerName)

        return io.checkFile(providerClassDir, 'product', 'js')
      })
  }
}