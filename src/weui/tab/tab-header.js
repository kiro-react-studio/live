import { Component, h } from 'preact';
import classNames from 'classnames';

export default class extends Component {
  render({ children, className }) {
    return (
      <div className={classNames('weui-navbar', className)}>{children}</div>
    );
  }
}
