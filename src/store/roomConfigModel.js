import { observable, computed, action } from 'mobx';
import { Config, Storage } from 'util';

// 注：data文件夹存放了一些敏感信息，不会公开出来，开发者需要自己设置这些值
import myConfig from 'data';

import defaultConfig from './config';

// window.WebRTC = window.WebRTC || window.NRTC;

export default class RoomConfig {
  // 和房间聊天室相关配置
  @observable state = Object.assign({}, defaultConfig.roomInfo);

  @computed
  get rerefshEnv() {
    console.log(state);
    return;
  }

  @action
  setStatus(obj = {}) {
    // 临时测试
    if (obj.audioVolumn) return;
    console.log('store --> Room -> setStatus', obj);
    this.state = Object.assign(this.state, obj);
  }

  // 设置自己的uid
  @action
  setUid(uid) {
    console.log('store --> Room -> setUid', uid);
    this.state.uid = uid;
    console.log(this.state);
    Storage.set('uid', uid)
  }

  // 设置主播uid
  @action
  setHostUid(uid) {
    console.log('store --> Room -> setHostUid', uid);
    this.state.hostUid = uid;
    console.log(this.state);
  }

  // 设置当前房间
  @action
  setRoom(room) {
    console.log('store --> Room -> setRoom', room);
    this.state.room = room;
    console.log(this.state);
  }

  @action
  setEnv(env) {
    this.state.env = env;
    this.state.appKey = myConfig[env].appKey;
    this.state.requestUrl = myConfig[env].requestUrl;
    this.state.websocket_rtc = myConfig[env].websocket.rtc;
    console.log(this.state);
  }

  @action
  setRole(role) {
    console.log('store --> Room -> setRole', role);
    this.state.role = role;
    this.state.autoStart = /[02]/.test(role);
  }

  @action
  setCalling(isOn) {
    this.state.calling = !!isOn;
    console.log('store --> Room -> setCalling', isOn, this.state.calling);
  }

  @action
  setChannelName(roomName) {
    this.state.roomName = roomName;
    console.log('store --> Room -> setChannelName', roomName, this.state.roomName);
  }

  @action
  setRoomList(data) {
    this.state.roomList = data;
    console.log('store --> Room -> setRoomList', data, this.state.roomList);
  }
}
