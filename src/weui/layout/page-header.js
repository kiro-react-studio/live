/*
 * @Author: lduoduo 
 * @Date: 2018-01-18 14:44:51 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-18 14:48:03
 * 头部布局，使用方法如下
 * <PageHeader title="设置" options={option} />
 * option: [obj1,obj2]
 * 最多左右两个按钮： obj1, obj2
 * obj1: {
 *  icon: 需要的iconfont图标名字
 *  click: 点击事件
 * }
 * 
 * 注意：如果点击事件需要使用默认的，不要传click
 */

import { Component, h } from 'preact';
import { route } from 'preact-router';

export default class extends Component {
  clickE = e => {};
  clickB = e => {
    history.back();
  };
  clickF = e => {
    route('/');
  };

  render({ title, desc, options = [] }) {
    const class1 = options[0] ? options[0].icon || 'icon-fanhui' : '';
    const class2 = options[1] ? options[1].icon || 'icon-tubiaolunkuo-' : '';
    const click1 = options[0] ? options[0].click || this.clickB : this.clickE;
    const click2 = options[1] ? options[1].click || this.clickF : this.clickE;

    return (
      <header className="page__hd">
        <span
          className={`page__hd__item icon iconfont ${class1}`}
          onClick={click1}
        />
        <h1
          className="page__hd__item page__title"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <span
          className={`page__hd__item icon iconfont ${class2}`}
          onClick={click2}
        />
      </header>
    );
  }
}
