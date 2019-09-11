const fs = require('fs')
const path = require('path')

function getInstancesDir () {
  return path.resolve(__dirname, `./instances/`)
}

function getInstancePath(instancesDir, instanceName) {
  return instancesDir + '/' + instanceName + '/' + 'index.js'
}

module.exports = {
  load(name) {
    // resolve 创建函数路径
    const instancesDir = getInstancesDir()
    const createFnPath = getInstancePath(instancesDir, name)

    return new Promise((resolve, reject) => {
      // check 文件是否存在
      fs.access(createFnPath, fs.constants.F_OK, err => {
        if (err) {
          return reject(err)
        }

        let servlet
        try {
          // 默认/instances/${name}/index.js 提供的时创建servlet实例的函数
          servlet = require(createFnPath).call()
        } catch (e) {
          reject(e)
        }

        resolve(servlet)
      })
    })
  }
}