import { RoomConfigModel } from 'store';

const store = new RoomConfigModel();

// 测试
window.stores = window.stores || {}
stores.room = store;

export default {
  data: store.state,
  setUid: store.setUid.bind(store),
  setEnv: store.setEnv.bind(store),
  setRole: store.setRole.bind(store),
  setCalling: store.setCalling.bind(store),
  setChannelName: store.setChannelName.bind(store),
  setRoomList: store.setRoomList.bind(store),
};
