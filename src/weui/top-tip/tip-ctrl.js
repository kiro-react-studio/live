import TopTip from './tip';

export default class TopTipCtrl {
  static _instance = null;

  static createInstance(inProps) {
    this._instance = this._instance || TopTip.newInstance(inProps);
    return this._instance;
  }

  static show(inOptions) {
    if (!this._instance) {
      this.createInstance();
    }
    const { timeout = 5 } = inOptions;

    this._instance.component.show(inOptions);
    if (timeout) {
      setTimeout(() => {
        if (!this._instance) return;
        this._instance.destroy();
        this._instance = null;
      }, timeout * 1000);
    }
  }

  static hide() {
    return this._instance.component.hide();
  }

  static destory() {
    this._instance.destory();
    this._instance = null;
  }
}
