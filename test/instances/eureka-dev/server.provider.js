const WebServlet = require('../../../index')

WebServlet.load('eureka-dev')
  .then(servlet => {
    console.log("成功构建eureka-servlet")

    servlet.provide({
      id: 'xxx',
      type: 'haoname',
      name: 'hao-name',
    })
  })
