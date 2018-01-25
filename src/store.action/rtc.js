import { RtcConfigModel } from 'store';

const store = new RtcConfigModel();

// 测试
window.stores = window.stores || {}
stores.rtc = store;

export default {
  data: store.state,
  setUid: store.setUid.bind(store),
  setEnv: store.setEnv.bind(store),
  setScene: store.setScene.bind(store),
  setRole: store.setRole.bind(store),
  setAudioSelf: store.setAudioSelf.bind(store),
  setChannelName: store.setChannelName.bind(store),
  setRtmpUrl: store.setRtmpUrl.bind(store),
  setCamera: store.setCamera.bind(store),
  setCameraList: store.setCameraList.bind(store),
  setCameraEnable:store.setCameraEnable.bind(store),
  setMicro: store.setMicro.bind(store),
  setMicroList: store.setMicroList.bind(store),
  setMicroEnable:store.setMicroEnable.bind(store),
  setCalling: store.setCalling.bind(store),
  setStatus: store.setStatus.bind(store),
  setWssArr: store.setWssArr.bind(store),
  setNodeLocal: store.setNodeLocal.bind(store),
  setNodeRemote: store.setNodeRemote.bind(store)
};
