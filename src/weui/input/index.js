import {Component, h} from 'preact';

import classNames from 'classnames';

export default class extends Component {
  static defaultProps = {
    type: 'text'
  };

  render(props) {
    const {className, type, onInput, onChange, ...options} = props;
    return (
      <input className={classNames('weui-input', className)} onInput={onInput} onChange={onChange} type={type}  {...options} />
    );
  }
}
