import { Component, h } from 'preact';
import classNames from 'classnames';

import IconFooterImg from 'assets/images/icon_footer_link.png';

export default class extends Component {
  render({ bottom, children, className }) {
    console.log('footer children', children)
    return (
      <footer
        className={classNames('page__ft', {
          j_bottom: bottom
        })}
      >
        {children ? (
          { children }
        ) : (
          <a href="/">
            <img src={IconFooterImg} />
          </a>
        )}
      </footer>
    );
  }
}
