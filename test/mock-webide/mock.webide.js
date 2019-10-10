/**
 * load servlet implement
 */
const WebideServlet = require('../../index')


WebideServlet.load('eureka-dev')
  .then(servlet => {
    console.log("成功构建eureka-servlet")

    servlet.autoUpdateProductInfo()


    setTimeout(() => {

      let productInfo = servlet.allProductInfo()

      console.log(productInfo)
    }, 1000)
  })
  .catch(console.error)




/**
 * start simply server
 */
const express = require('express')
const http = require('http')

let app = express()
let server = http.createServer(app)

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static())


server.listen(8888)
