const WebServlet = require('../../../index')

WebServlet.load('eureka-dev')
  .then(servlet => {
    console.log("成功构建eureka-servlet")

    servlet.client.fetchRegistry(e => {
      console.log(servlet.client)
      debugger
    })
  })

