const WebServlet = require('../../../index')
const http = require('http')

const servletProperties = {
  serviceType: 'test-service'
}

WebServlet.load('eureka-dev', servletProperties)
  .then(servlet => {
    console.log("成功构建eureka-servlet")

    const server = http.createServer()
    const metadata = {
      id: 'id-metadata',
      type: 'type-metadata',
      name: 'name-metadata',
      host: 'localhost',
      port: '8888'
    }
    const options = {
      server
    }

    let provider = servlet.provide(metadata, options)

    // provider.socketServer.attach(8888)

    server.listen(8888, () => {
      console.log('id: ', provider.id)
      console.log('metadata.id: ', provider.get('id'))
      console.log('metadata.type: ', provider.get('type'))
      console.log('metadata.name: ', provider.get('name'))
      console.log('metadata.host: ', provider.get('host'))
      console.log('metadata.port: ', provider.get('port'))
    })

  })
