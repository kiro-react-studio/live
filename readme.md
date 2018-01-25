## live

live demo , H5直播探索demo, 只适配移动端，正在进行中

[线上地址](https://ldodo.cc/static/live/)

### 技术栈

- [x] SDK打包构建：rollup
- [x] DEMO打包构建：parcel(热更新, Server代理)
- [x] 包管理：Yarn || Npm
- [x] UI库：Preact
- [x] UI组件：weui - 参考来自 `preact-weui`
- [x] 字体图标：iconfont
- [x] 路由：Preact-Router
- [x] JS：ES6 / ES7
- [x] babel
- [x] postcss
- [x] 样式：Less / CSS
- [x] 状态管理：Mobx / Mobx-Preact
- [x] 音视频SDK：网易云信实时音视频SDK
- [x] 房间状态管理SDK: rollup打包

### 前置环境搭建注意事项

1. parcel 打包零配置，基本需要一个.babelrc就够了
2. 如果使用全局安装 parcel, parcel 的 cli 中使用了 `async` 函数，需要升级 `node` 环境为 `8+`
3. parcel 目前的弊端：
    -   没有配置文件，无法进行打包前的预处理，比如路径啊，前缀啊，环境变量啊。。。只能自己写脚本进行处理好再进行打包
    -   注意缓存文件夹 `.cache`，如果在编译的过程中，发现自己的改动没有生效，请删除该文件夹再进行编译打包
    -   报错信息不够友好
4. rollup 目前使用 alias 还有问题

### 开发起步

1. git clone
2. yarn
3. 启动dev编译
    -   带web托管：yarn start
    -   纯粹编译（需要自己启动web服务）：yarn dev
4. 启动开发watch room sdk: yarn sdk-dev

### 线上打包

1. 编译 room sdk: yarn sdk-prd
2. 编译 live demo: yarn build

### 注意

- 根目录下的data文件夹里存放了一些敏感信息，不会公开出来，开发者需要自己新建data文件夹，自己设置一些值，具体值如下:
    -   rtmpUrl: 推流地址
    -   appKey: 网易云信申请的 appKey
    -   requestUrl: 网易云信 NRTC 请求 token 的地址

### 效果预览

![运行效果](//raw.githubusercontent.com/lduoduo/live/master/preview/im1.png)
![运行效果](//raw.githubusercontent.com/lduoduo/live/master/preview/im2.png)
![运行效果](//raw.githubusercontent.com/lduoduo/live/master/preview/im3.png)
![运行效果](//raw.githubusercontent.com/lduoduo/live/master/preview/im4.png)

### 参考资料
1. [Preact](https://preactjs.com/)
2. [Mobx](https://github.com/mobxjs/mobx)
3. [Mobx-Preact](https://github.com/mobxjs/mobx-preact)
3. [Preact-weui](https://github.com/afeiship/preact-weui)
4. [Parcel](https://github.com/parcel-bundler/parcel)
5. [实时音视频SDK](https://netease.im/im-sdk-demo)

### 问题
1. rollup 打包设置 alias 还有问题