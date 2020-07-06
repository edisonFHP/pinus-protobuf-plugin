pinus-protobuf-plugin
====================

pinus-protobuf-plugin 是一个 pinus 插件。

pinus-protobuf-plugin 提供 protobuf 的编解码功能, 内部使用 [ProtoBuf.js](https://www.npmjs.com/package/protobufjs) 来实现。

提供这个插件是要解决什么问题：
* 之前只有 pomelo 的版本，pinus 的还没有
* pomelo 版本不支持 bool 类型和 64 位整型

此插件增加了对 bool 和 64 位整型的支持，配合客户端 [pinus-unityclient-socket](https://github.com/bruce48x/pomelo-unityclient-socket) 使用，此客户端是 C# 编写提供给 unity 使用的。

## 安装

```
npm install pinus-protobuf-plugin
或者
yarn add pinus-protobuf-plugin
```

## 使用

协议文件默认是 `/config/serverProtos.proto` 和 `/config/clientProtos.proto`

写法就是正常的 protobuf v3 的写法，<strong>目前</strong>需要注意：
* 不支持 package 语法
* 不支持嵌套 message

例如 `serverProtos.proto`

```proto
syntax = "proto3";

message connectorentryHandlerentry {
    uint32 code = 1;
    string msg = 2;
}
```

使用前需要转为 json 文件，使用命令
```shell
# 安装 pbjs
npm i -g protobufjs
# 编译 proto 为 json
pbjs -t json serverProtos.proto > serverProtos.json
pbjs -t json clientProtos.proto > clientProtos.json
```

代码中使用
```typescript
// app.ts
import { Protobuf } from 'pinus-protobuf-plugin';
app.use(Protobuf);
```

# 例子
提供了一个服务端+客户端的示例，演示如何试用：[example-pinus-unity](https://github.com/bruce48x/example-pinus-unity-client)
