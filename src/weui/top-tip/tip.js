import { Component, h } from 'preact';
import appendToDocument from 'preact-append-to-document';

import classNames from 'classnames';

export default class extends Component {
  static newInstance(inProps) {
    return appendToDocument(this, inProps, {
      className: 'preact-tip-docker'
    });
  }

  state = {
    visible: false,
    loading: false
  };

  show(inProps) {
    const { visible } = this.state;
    const newProps = Object.assign(this.state, this.props, inProps);
    !visible && this.setState(newProps);
    return this;
  }

  hide() {
    const { visible } = this.state;
    visible && this.setState({ visible: false });
    return this;
  }

  render({ children }) {
    const { content, loading, className } = this.state;
    console.log('tip content loading', content, loading);
    return (
      <div className={classNames('weui-toptips weui-toptips_info', className)}>
        {loading && <i class="weui-loading" />}
        {content}
      </div>
    );
  }
}
