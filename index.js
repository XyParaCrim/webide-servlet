const fs = require('fs')
const path = require('path')

function getInstancesDir () {
  return path.resolve(__dirname, `./instances/`)
}

function getInstancePath(instancesDir, instanceName) {
  return instancesDir + '/' + instanceName + 'index.js'
}

export default {
  load(name) {
    const instancesDir = getInstancesDir()
    const instancePath = getInstancePath(instancesDir, name)

    return new Promise((resolve, reject) => {
      fs.access(instancePath, fs.constants.F_OK, err => {
        if (err) {
          return reject(err)
        }

        const ServletConstructor = require(instancePath)
        resolve(new ServletConstructor())
      })
    })
  }
}