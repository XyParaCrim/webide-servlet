const fs = require('fs')
const path = require('path')

module.exports = {
  loadFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.access(filePath, fs.constants.F_OK, error => {
        if (error) {
          return reject(error)
        }

        resolve(require(filePath))
      })
    })
  },

  resolve(absolute, relation) {
    return path.resolve(absolute, relation)
  },

  resolveFile(dir, file) {
    return dir + '/' + file
  },

  checkFile(dir, file, suffix) {
    return new Promise((resolve, reject) => {
      let filePath = dir + '/' + file + '.' + suffix
      fs.access(filePath, fs.constants.F_OK, error => {
        if (error) {
          return reject(error)
        }

        resolve(filePath)
      })
    })
  }
}

