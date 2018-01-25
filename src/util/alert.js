/*
 * weui的弹框简单再封一层
 * @Author: lduoduo 
 * @Date: 2018-01-12 16:04:00 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-25 23:48:27
 */

import { WeuiDialogCtrl } from 'weui/dialog';

/**
 * option.msg 弹框内容
 * option.btns 按钮数组
 * option.btns.fn 弹框按钮回调
 * @param {*} option
 */
export default function(option = {}) {
  const { title, msg, btns } = option;
  const footer = [];
  btns &&
    btns.map(item => {
      footer.push({
        content: item.content || '好哒',
        theme: 'primary',
        onClick: () => {
          item.fn && item.fn();
        }
      });
    });
  if (footer.length === 0) {
    footer.push({
      content: '好哒',
      theme: 'primary',
      onClick: function(){}
    });
  }
  WeuiDialogCtrl.show({
    header: title,
    body: msg.constructor === String ? msg : JSON.stringify(msg),
    footer
  });
}
