# webide-servlet

[![codebeat badge](https://codebeat.co/badges/776c4415-b154-45f7-9e30-45cf8c2f24f9)](https://codebeat.co/projects/github-com-xyparacrim-webide-servlet-master)

## Features

Services Implement:

- [Memory](https://github.com/XyParaCrim/webide-servlet/tree/master/packages/servlet/eureka)
- [Eureka](https://github.com/XyParaCrim/webide-servlet/tree/master/packages/servlet/memory)

Server-Client Implement:

- [socket.io](https://github.com/XyParaCrim/webide-servlet/tree/master/packages/provider-product/socket-io)

## Issues

### Memory-Servlet-1.0

#### 2019.9.18

    - [支持中...]在Product端, 获取的值Api，以及考虑不同的存储方式（cookie，etc）-> adapter pattern
    - [支持中...]在Provider端，设置、更新、删除的值的Api设计 -> 缺少删除接口
    - [支持中...]日志报告或者足够的运行、开发信息展示 -> 不完整、略混乱
    - [支持中...]怎么表达让外部直到未attach的时刻 -> 典型的错误作为callback的参数
    - [未开始]完善Servlet、Product、Provider的状态表达
    - [未开始]属性之间的关系（严重）
    - [未开始]在Servlet里，合理映射Provider，满足不同查询（type，id，pid， etc）

#### 2019.9.24
    
    - [未开始]eureka-servlet: 动态修改值不是生效
    - [未开始]eureka-servlet: 后于注册中心或者重启后，依然检测心跳，但是未注册上
    - [未开始]eureka-servlet: 隐藏了修改metadata这个动作（为了适配socket.io的启动端口）
    - [未开始]eureka-servlet: 验证垃圾回收效果>对象池创建成本（因为eureka-js-client的关系，未使用任何对象池）
    - [未开始]concrete-adapter的设计（被迫在其他对象中使用; 用处单调）
    - [未开始]统一info、metadata、options的概念
    - [未开始]考虑只是单纯provide信息
    - [未开始]怎样安装特定实现的依赖