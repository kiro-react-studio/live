import { CommonConfigModel } from 'store';

const store = new CommonConfigModel();

// 测试
window.stores = window.stores || {}
stores.common = store;

export default {
  data: store.state,
  setInited: store.setInited.bind(store)
};
