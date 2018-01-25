/*
 * @Author: lduoduo 
 * @Date: 2018-01-13 23:57:19 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-25 20:34:15
 * 和房间状态相关流程和逻辑
 */

import { Config, TopTip, Pipes } from 'util';

// 引入状态管理模块
import { RoomConfig, RtcConfig } from 'store.action';
const Status = RoomConfig.data;

export default {
  room: null,
  init() {
    if (this.room) {
      return Promise.resolve();
    }
    this.room = new ROOM();
    this.initRoomEvent();
    return this.connect();
  },
  initRoomEvent() {
    const room = this.room;
    room.on('connected', data => this.onConencted(data));
    room.on('reConnecting', data => this.onReConnecting(data));
    room.on('close', data => this.onClose(data));
    room.on('create', data => this.onCreate(data));
    room.on('roomlist', data => this.onRoomList(data));
    room.on('create', data => this.onCreate(data));
    room.on('join', data => this.onJoin(data));

    window.addEventListener('beforeunload', this.beforeunload.bind(this));
  },
  beforeunload() {
    this.room.leave();
  },
  connect() {
    TopTip.show({
      loading: true,
      content: '正在连接服务器',
      timeout: null
    });
    return this.room
      .init({ url: Config.url.wss, uid: Status.uid })
      .then(res => {
        TopTip.show({
          content: '服务器连接成功',
          loading: false,
          timeout: 2
        });
        console.log('server login success', res);
        const { data } = res;
        if (!Status.uid || Status.uid !== data.uid) {
          RoomConfig.setUid(data.uid);
          RtcConfig.setUid(data.uid);
        }
        // 在room.js中调用，不加这一句，直接跳到initRtc??
        // return Promise.resolve()
      });
  },
  // 断开重连
  onClose() {
    // this.connect();
    TopTip.show({
      content: '当前无法连接服务器',
      loading: false,
      timeout: 3
    });
  },
  onReConnecting() {
    TopTip.show({
      content: '正在连接服务器',
      loading: true,
      timeout: null
    });
  },
  onConencted() {
    TopTip.show({
      content: '服务器连接成功',
      loading: false,
      timeout: 2
    });
  },
  onRoomList(data) {
    RoomConfig.setRoomList(data);
  },
  onCreate(message) {},
  create(data) {
    return this.room.create(data).then(result => {
      const fn = result.status ? 'resolve' : 'reject';
      return Promise[fn](result.data);
    });
  },
  onJoin() {},
  join(data) {
    return this.room.join(data).then(result => {
      const fn = result.status ? 'resolve' : 'reject';
      return Promise[fn](result.data);
    });
  },
  leave() {
    this.room.leave();
  }
};
