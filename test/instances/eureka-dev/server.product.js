const WebServlet = require('../../../index')

WebServlet.load('eureka-dev')
  .then(servlet => {
    console.log("成功构建eureka-servlet")

    servlet.autoUpdateProductInfo()

    setTimeout(() => {
      let allProductInfo = servlet.productInfo()
      let testProductInfo =servlet.productInfo('test-service')

      console.log('all productInfo')
      console.log(servlet.productInfo())

      console.log('test productInfo')
      console.log(servlet.productInfo())

      let product = servlet.providerFactory()
        .createProduct(testProductInfo[0])

      product.attach(() => {
        console.log('成功连接')
      })

    }, 1000)
  })

