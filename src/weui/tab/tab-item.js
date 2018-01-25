import { Component, h } from 'preact';
import classNames from 'classnames';

export default class extends Component {
  render({ children, className, active, onClick }) {
    return (
      <div
        className={classNames(
          'weui-navbar__item',
          className,
          `${active ? 'active' : ''}`
        )}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }
}
