import { Component, h } from 'preact';
import classNames from 'classnames';

export default class extends Component {
  render({ children, className }) {
    return (
      <nav className={classNames('weui-tab', className)}>
        {children}
      </nav>
    );
  }
}
