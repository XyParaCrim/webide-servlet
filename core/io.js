const fs = require('fs')

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
  }
}

