/*
 * @Author: lduoduo 
 * @Date: 2018-01-14 20:40:46 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-25 20:20:41
 * 信令通信连接SDK
 * 事件注册
 *  signal.on('connected', this.onConnected.bind(this))
    signal.on('join', this.join.bind(this))
    signal.on('leave', this.leave.bind(this))
    signal.on('stop', this.stop.bind(this))
 */
// import { Events } from 'util';
import Events from '../src/util/events';

export default class Signal extends Events {
  constructor(obj = {}) {
    super(obj);
    this.reset();
  }
  init() {
    window.addEventListener('beforeunload', this.beforeunload.bind(this));
  }
  // 重置状态
  reset() {
    this.inited = false;
    if (!this.ws) return;
    this.ws.onopen = null;
    this.ws.onmessage = null;
    this.ws.onerror = null;
    this.ws.onclose = null;
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close();
    }
    this.ws = null;
  }
  beforeunload() {
    if (this.inited) {
      this.unload();
    }
  }
  /**
   * 加入房间，由于目前参数是带在url上的，这边要处理一下
   * @param {any} url // 信令地址
   * @returns
   */
  connect(option = {}) {
    let { url } = option;

    // 初次连接登录
    if (!this.inited && url) {
      this.url = url;
      this.initSignal();
    }
  }

  initSignal() {
    let that = this;
    // this.ws = address;
    var ws = (this.ws = new WebSocket(`wss://${this.url}`));

    ws.onopen = () => {
      that.inited = true;
      console.log('websocket connected');
      this.emit('connected', {
        status: true,
        data: {
          wss: this.ws.url
        }
      });
    };
    ws.onmessage = e => {
      let data = e.data || null;
      data = JSON.parse(data);
      // console.log(data);
      switch (data.type) {
        case 'self':
          that.onself(data.data);
          break;
        case 'sys':
          that.onsys(data.data);
          break;
        case 'peer':
          that.onPeer(data.data);
          break;
      }
    };

    ws.onclose = () => {
      that.inited = false;
      console.log('Signal connection lost');
      that.isReconect = true;
      that.emit('close');
    };

    // 缓存原始send方法
    let send = ws.send;
    // 包装send方法
    ws.send = function(data) {
      if(ws.readyState !== WebSocket.OPEN){
        return
      }
      // send.call(this, data);
      send.call(this, JSON.stringify(data));
      // console.log(data)
      console.log(`websocket send: ${data.type}`, data.data);
    };
  }

  // 发给自己的消息
  onself(message) {
    const { type, code, data } = message;
    console.log(`${type} ${code === 200 ? 'success' : 'failed'}`);

    this.emit(type, {
      status: code === 200,
      data
    });
  }
  // 系统消息
  onsys(data) {
    // 拉取房间列表
    if (data.type === 'roomlist') {
      this.emit('roomlist', data.data);
    }
    // 有人加入
    if (data.code === 200 && data.type === 'in') {
      this.emit('join');
    }
    // 有人退出
    if (data.code === 200 && data.type === 'out') {
      this.emit('leave', data.data);
    }
  }
  // 发送peer消息
  sendPeer() {
    this.ws.send({
      type: 'peer',
      data: {
        status: 'ready',
        data: 222
      }
    });
  }
  // peer消息
  onPeer(data) {
    // let {type, data} = data
    if (!data.type) return;
    this.emit(data.type, data.data);
  }
  // 给服务端发送peer消息
  send(type, data) {
    if (type === 'connected') return;
    this.ws.send({ type, data });
  }
  join(roomId) {
    if (!roomId) return;
    this.ws.send({
      type: 'join',
      data: {
        roomId: roomId
      }
    });
  }
  leave(option = {}) {
    const { userId, roomId } = option;
    if (!roomId || !userId) return;
    this.ws.send({
      type: 'leave',
      data: {
        userId,
        roomId
      }
    });
  }
  unload() {
    this.ws.send({
      type: 'unload'
    });
  }
  destroy() {
    if (!this.ws) return;
    this.ws.send({
      type: 'leave',
      data: {
        userId,
        roomId
      }
    });
    this.reset();
  }
}
