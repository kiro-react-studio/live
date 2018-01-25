import { h, Component } from 'preact';

export default class Option extends Component {
  render() {
    return (
      <div className="weui-header">
        <div
          className="weui-setting-icon icon iconfont icon-shezhi-tianchong"
          onClick={this.props.onClick}
        />
        <div
          className="weui-setting-icon icon iconfont icon-icon--3"
          onClick={this.props.onLeave}
        />
      </div>
    );
  }
}
