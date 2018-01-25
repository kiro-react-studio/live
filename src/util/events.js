/**
 * preact 默认事件
 */

export default class Events {
  constructor(obj = {}) {
    this.listeners = {};
    this.info = obj;
  }

  static defaultOnChange(e) {
    console.log('onChange', e);
  }
  static defaultOnClick(e) {
    console.log('onClick', e);
  }

  // 注册监听回调事件
  on(name, fn) {
    if (fn.constructor !== Function) return;
    this.listeners[name] = fn;
  }

  // 执行回调
  emit(name, data) {
    this.listeners[name] && this.listeners[name](data);
  }
}
