const io = require('./core/io')
const Servlet = require('./core/servlet')

const INSTANCES_DIR = io.resolve(__dirname, './instances/')
const PACKAGES_DIR = io.resolve(__dirname, './packages/')

const INDEX_FILE_NAME = 'index'
const INSTANCE_JSON_NAME = 'instance'

module.exports = {
  load(instanceName) {
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
        let packageName = instanceOptions.package
        let packageDir = io.resolveFile(PACKAGES_DIR, packageName)

        return io.checkFile(packageDir, 'servlet', 'js')
          .then(servletPath => {
            // 创建一个servlet实例
            let servlet = createServlet(require(servletPath))
            if (!servlet instanceof Servlet) {
              throw Error(`Failed to create the servlet{${packageName}: ${packageDir}}`)
            }

            return new Promise(resolve => servlet.attach(() => resolve(servlet)))
          })

      })
  },
  resolveProductFactoryPath(instanceName) {
    // resolve 创建函数路径
    const instanceDir = io.resolve(INSTANCES_DIR, instanceName)

    return io.checkFile(instanceDir, INSTANCE_JSON_NAME, 'json')
      .then(path => {
        let instanceOptions = require(path)
        let packageName = instanceOptions.package
        let packageDir = io.resolveFile(PACKAGES_DIR, packageName)

        return io.checkFile(packageDir, 'product', 'js')
      })
  }
}