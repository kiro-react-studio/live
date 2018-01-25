/*
 * weui的toptip
 * @Author: lduoduo 
 * @Date: 2018-01-12 16:04:00 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-21 00:34:57
 */

import { TopTipCtrl } from 'weui/top-tip';

/**
 * option.msg 弹框内容
 * option.btns 按钮数组
 * option.btns.fn 弹框按钮回调
 * @param {*} option
 */
export default {
  show(option) {
    console.log('show toptip', option);
    TopTipCtrl.show(option);
  },
  close() {
    console.log('close toptip');
    TopTipCtrl.destory();
  }
};
