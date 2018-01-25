/*
 * @Author: lduoduo 
 * @Date: 2018-01-06 23:14:49 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-20 22:05:05
 * 
 * radio组合，只需要传入list列表即可，具体参数说明
 * name: input的name
 * items: {Array} 需要显示的radio列表
 * value: 当前默认选中的值
 * option: items每项可以是基础类型，也可以是object， 当为object时需要通过该字段自定 label 字段和 value 字段
 */

import { Component, h } from 'preact';
import classNames from 'classnames';
import { Events } from 'util';

export default class extends Component {
  static defaultProps = {
    items: [],
    value: 0,
    onChange: Events.defaultOnChange
  };

  get children() {
    const { name, items, value, option } = this.props;

    return items.map((item, index) => {
      const idFor = `id-${name}-${index}`;
      // console.log('item index', item, index);
      if (item.constructor !== Object) {
        item = { value: item, label: item };
      }

      const label = option ? item[option.label] : item.label;
      const _value = option ? item[option.value] : item.value;
      // console.log('_value label value', _value, label, value)
      return (
        <label htmlFor={idFor} className="weui-cell weui-check__label">
          <div className="weui-cell__bd">{label}</div>
          <div className="weui-cell__ft">
            <input
              type="radio"
              onChange={this._onChange.bind(this, _value, index)}
              checked={_value === value}
              name={name}
              id={idFor}
            />
            <span
              className={`icon iconfont success ${
                _value === value ? 'icon-xuanze-danxuan' : 'icon-xuanze-moren'
              }`}
            />
          </div>
        </label>
      );
    });
  }

  _onChange = (value, index, event) => {
    const { onChange } = this.props;
    onChange({ target: { value, index } });
    event.stopPropagation();
  };

  render(props) {
    const { className, items, children, ...options } = props;
    return (
      <section
        className={classNames('weui-cells weui-cells_radio', className)}
        {...options}
      >
        {this.children}
        {children}
      </section>
    );
  }
}
