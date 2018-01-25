import { observable, computed, action } from 'mobx';
import { Config } from 'util';

// 注：data文件夹存放了一些敏感信息，不会公开出来，开发者需要自己设置这些值
import myConfig from 'data';

import defaultConfig from './config';

window.WebRTC = window.WebRTC || window.NRTC;

export default class RtcConfig {
  // 和WEBRTC相关配置
  @observable state = Object.assign({}, defaultConfig.rtcInfo);

  // @observable state.env;
  // @observable state.channelName;
  // @observable state.uid;
  // @observable state.role;
  // @observable state.audioSelf;
  // @observable state.rtmpUrl;
  // @observable state.videoDevices;
  // @observable state.videoDevice;
  // @observable state.microDevices;
  // @observable state.microDevice;
  // @observable state.playVolume;
  // @observable state.captureVolume;

  @computed
  get rerefshEnv() {
    console.log(state);
    return;
  }

  @action
  setStatus(obj = {}) {
    // 临时测试
    if (obj.audioVolumn) return;
    console.log('store --> rtc --> setStatus', obj);
    this.state = Object.assign(this.state, obj);
  }

  @action
  setUid(uid) {
    console.log('store --> rtc -> setUid', uid);
    this.state.uid = uid;
    console.log(this.state);
  }

  @action
  setEnv(env) {
    console.log('store --> rtc --> setEnv', env);
    this.state.env = env;
    this.state.appKey = myConfig[env].appKey;
    this.state.requestUrl = myConfig[env].requestUrl;
    this.state.websocket_rtc = myConfig[env].websocket.rtc;
    console.log(this.state);
  }

  @action
  setScene(scene) {
    console.log('store --> rtc --> setScene', scene);
    this.state.scene = scene;
    this.state.role = scene === 1 ? 0 : 1;
    console.log(this.state);
  }

  @action
  setRole(role) {
    console.log('store --> rtc --> setRole', role);
    this.state.role = role;
    this.state.autoStart = /[02]/.test(role);
  }

  @action
  setAudioSelf(isOn) {
    this.state.audioSelf = !!isOn;
    console.log('store --> rtc --> setAudioSelf', isOn, this.state.audioSelf);
  }

  @action
  setChannelName(channelName) {
    this.state.channelName = channelName;
    console.log(
      'store --> rtc --> setChannelName',
      channelName,
      this.state.channelName
    );
  }

  @action
  setRtmpUrl(rtmpUrl) {
    this.state.sessionConfig.rtmpUrl = rtmpUrl;
    console.log('store --> rtc --> setRtmpUrl', rtmpUrl, this.state.sessionConfig.rtmpUrl);
  }

  @action
  setCamera(device = {}) {
    let tmp;
    if (device.constructor === Object) {
      tmp = device;
    } else {
      tmp = this.state.videoDevices.filter(item => {
        return item.deviceId === device;
      });
      tmp = tmp && tmp[0];
    }

    this.state.videoDevice = tmp;
    console.log('store --> rtc --> setCamera', device, this.state.videoDevice);
  }

  @action
  setCameraList(list) {
    this.state.videoDevices = list;
    console.log('store --> rtc --> setCameraList', list, this.state.videoDevices);
  }

  @action
  setCameraEnable(isOn) {
    this.state.cameraEnable = !!isOn;
    console.log('store --> rtc --> setCameraEnable', !!isOn, this.state.cameraEnable);
  }

  @action
  setMicro(device = {}) {
    let tmp;
    if (device.constructor === Object) {
      tmp = device;
    } else {
      tmp = this.state.microDevices.filter(item => {
        return item.deviceId === device;
      });
      tmp = tmp && tmp[0];
    }

    this.state.microDevice = tmp;
    console.log('store --> rtc --> setMicro', device, this.state.videoDevice);
  }

  @action
  setMicroList(list) {
    this.state.microDevices = list;
    console.log('store --> rtc --> setMicroList', list, this.state.microDevices);
  }

  @action
  setMicroEnable(isOn) {
    this.state.microEnable = !!isOn;
    console.log('store --> rtc --> setMicroEnable', !!isOn, this.state.microEnable);
  }

  @action
  setCalling(isOn) {
    this.state.calling = !!isOn;
    console.log('store --> rtc --> setCalling', isOn, this.state.calling);
  }

  @action
  setWssArr(list = []) {
    this.state.wssArr = list;
    console.log('store --> rtc --> setWssArr', list, this.state.wssArr);
  }

  @action
  setNodeLocal(node) {
    this.state.nodeLocal = node;
    console.log('store --> rtc --> setNodeLocal', node, this.state.nodeLocal);
  }

  @action
  setNodeRemote(node) {
    this.state.nodeRemote = node;
    console.log('store --> rtc --> setNodeRmote', node, this.state.nodeRemote);
  }
}
