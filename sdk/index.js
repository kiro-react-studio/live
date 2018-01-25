/*
 * @Author: lduoduo 
 * @Date: 2018-01-14 20:39:13 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-25 20:52:47
 * 房间状态管理SDK，功能点如下
 * 1. 连接服务器，获取实时推送消息
 * 2. 获取实时房间列表
 * 3. 加入房间
 * 4. 拉取房间数据，更新状态
 * 5. 退出房间
 */

// import { Events } from '../src/util/index.js';
import Events from '../src/util/events';
import Signal from './signal';

// 限制重连次数
const reConnectLimit = 5;

export default class Room extends Events {
  constructor(obj = {}) {
    super(obj);
    this.reset();
  }
  reset() {
    this.stop();
    this.cleanTimer();
    this.timers = {};
    this.response = {};
    this.signal = null;
    this.reConnectCount = 0;
    this.reConnecting = false;
  }
  /**
   * 初始化ws连接
   * @param {object} option 配置对象
   */
  init(option) {
    if (!this.signal) {
      this.initSignal();
    }
    this.option = option;
    return this.connect();
  }
  initSignal() {
    const signal = (this.signal = new Signal());
    signal.on('connected', this.onConnected.bind(this));
    signal.on('heart', this.onHeartBeat.bind(this));
    signal.on('login', this.onLogin.bind(this));
    signal.on('create', this.onCreate.bind(this));
    signal.on('join', this.onJoin.bind(this));
    signal.on('leave', this.onLeave.bind(this));
    signal.on('close', this.onClose.bind(this));
    signal.on('roomlist', this.onRoomList.bind(this));
  }
  cleanTimer(timer) {
    if (timer) {
      return clearInterval(timer);
    }
    if (!this.timers) return;
    Object.keys(this.timers).map(item => {
      clearInterval(this.timers[item]);
    });
  }
  onConnected(message) {
    console.log('signal connected');
    this.response.connected.data = message;
    this.emit('connected');
  }
  onLogin(message) {
    console.log('signal logined');
    this.im = message.data;
    this.response.login.data = message;
    this.heartbeat();
  }
  onCreate(message) {
    this.emit('create', message);
    this.response.create.data = message;
  }
  onJoin(message) {
    console.log('user join', message);
    this.response.join.data = message;
  }
  onLeave(data) {
    console.log('user leave', data);
  }
  onClose(data) {
    console.log('signal close', data);
    this.onSignalLost(data);
  }
  onSignalTimeout(data) {
    console.log('signal timeout', data);
    this.onSignalLost(data);
  }
  onSignalLost(data) {
    if (this.reConnecting) return;
    this.emit('reConnecting');
    if (this.reConnectCount >= reConnectLimit) {
      this.emit('close');
    } else {
      this.reConnecting = true;
      ++this.reConnectCount;
      console.log('signal reconnect ', this.reConnectCount);
      this.connect()
        .then(() => {
          this.reConnecting = false;
          this.reConnectCount = 0;
        })
        .catch(err => {
          console.error(err);
          this.reConnecting = false;
          this.onClose();
        });
    }
  }
  onRoomList(data) {
    console.log('room list', data);
    this.emit('roomlist', data);
  }
  connect() {
    const option = this.option;
    this.signal.connect(option);

    return this.promise({
      type: 'connected',
      data: option,
      timeout: 5
    }).then(data => {
      return this.login(option);
    });
  }
  // 登录
  login(data) {
    return this.promise({
      type: 'login',
      data
    });
  }
  // 创建房间, 超时：30s
  create(data = {}) {
    const { roomName, uid } = data;
    if (!roomName || !uid)
      return Promise.reject('create room error: name or uid missing');

    return this.promise({
      type: 'create',
      data
    });
  }
  // 加入房间, 超时：30s
  join(data = {}) {
    const { uid, roomId } = data;
    if (!roomId || !uid)
      return Promise.reject('join room error: roomId or uid missing');
    return this.promise({
      type: 'join',
      data
    });
  }
  // 离开房间
  leave() {
    this.signal && this.signal.send('leave');
  }
  // 停止，断开连接
  stop() {
    this.signal && this.signal.send('leave');
  }
  // 销毁
  destroy() {
    this.signal && this.signal.destroy();
  }
  // 轮询timer
  promise(option = {}) {
    const { type, timeout = 30, data } = option;
    const tmp = (this.response[type] = {});

    if (type !== 'connected') {
      if (this.signal.ws.readyState !== WebSocket.OPEN)
        return Promise.reject({ error: '操作失败,通信已经断开' });
    }

    this.signal.send(type, data);
    return new Promise((resolve, reject) => {
      const now = Date.now();
      tmp.timer = setInterval(() => {
        if (tmp.data) {
          clearInterval(tmp.timer);
          tmp.timer = null;
          resolve(tmp.data);
          return;
        }
        if (!tmp.data && Date.now() - now >= timeout * 1000) {
          clearInterval(tmp.timer);
          tmp.timer = null;
          reject({ error: `${type} timeout` });
        }
      }, 1000);
    });
  }

  sendHeart(data) {
    this.signal && this.signal.send('heart', data);
  }

  // 心跳
  heartbeat() {
    if (this.isHeartBeating) return;
    this.heartBeatList = [];
    this.bindHearBeat(5);

    // 测试心跳服务包, 仅用于开发debug
    // this.heartBeatCount = 1
    // this.heartBeatTimer = setInterval(() => {
    //   // this.heartBeatCount++
    // }, 1000)
  }
  onHeartBeat(data) {
    this.heartBeatList.shift();
    this.bindHearBeat(5);
  }
  heartBeatHandler() {
    const data = this.im;
    const heartBeatList = this.heartBeatList;
    if (!heartBeatList) return;
    const current = Date.now();
    if (heartBeatList.constructor === Array && heartBeatList.length === 0) {
      heartBeatList.push(current);
      const param = Object.assign(data, { time: current });
      this.sendHeart(param);
      this.bindHearBeat(5);
      return;
    }

    const now = Date.now() - heartBeatList[0];
    if (now > 30 * 1000) {
      console.error('socket heartbeat timeout');
      this.onSignalTimeout();
      // this.emit('signalTimeout')
    } else if (now > 2 * 1000 && now < 30 * 1000) {
      console.warn('socket no response, keep heartbeat');
      heartBeatList.push(current);
      const param = Object.assign(data, { time: current });
      this.sendHeart(param);
      this.bindHearBeat(2);
    }
  }
  bindHearBeat(second) {
    this.isHeartBeating && clearTimeout(this.isHeartBeating);
    this.isHeartBeating = setTimeout(
      this.heartBeatHandler.bind(this),
      second * 1000
    );
  }
  stopHeartBeat() {
    if (this.isHeartBeating) {
      this.isHeartBeating && clearTimeout(this.isHeartBeating);
      this.heartBeatTimer && clearInterval(this.heartBeatTimer);
      this.isHeartBeating = null;
      this.heartBeatTimer = null;
      this.heartBeatList = null;
      this.heartBeatCount = 0;
    }
  }
}

Room.supportedListeners = {
  ready: '连接成功的回调',
  connected: '点对点webrtc连接成功的回调',
  stream: '收到远端流',
  data: '收到远端datachannel数据',
  stop: '连接断开',
  leave: '对方离开',
  text: '收到纯文本消息',
  message: '收到聊天信息',
  command: '收到指令',
  notify: '收到通知',
  sendFile: '文件发送中的实时状态',
  receiveFile: '文件接收中的实时状态',
  sendBuffer: '发送ArrayBuffer实时状态',
  receiveBuffer: '接收ArrayBuffer实时状态',
  sendBlob: '发送Blob实时状态',
  receiveBlob: '接收Blob实时状态'
};
