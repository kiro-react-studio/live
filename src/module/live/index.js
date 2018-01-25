import { h, Component } from 'preact';
import { route } from 'preact-router';

// 引入别的组件
import {Option, OptionMini} from '../option';

// 引入Rtc功能模块
import { Rtc } from 'flow';
// 引入本页面的扩展模块
import Ext from '../room/room.room';
import { setTimeout } from 'timers';

// 引入状态管理模块
import { RtcConfig } from 'store.action';
const Status = RtcConfig.data;

class Live extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOption: true
    };
  }

  componentDidMount() {
    console.log('Live loaded');
    this.init();
  }

  componentWillUnmount() {
    console.log('Live going to unload');
  }

  init() {
    setTimeout(this.initRtc.bind(this), 500);
    // 更新node节点
    LiveConfig.setNodeLocal(this.nodeLocal);
    LiveConfig.setNodeRemote(this.nodeRemote);
  }

  toggleOption(isOn) {
    if (!Status.calling && !isOn) {
      // 开始直播
      return this.joinChannel()
        .then(() => {
          LiveConfig.setCalling(true);
          this.setOption(isOn);
        })
        .catch(err => err && console.error(err));
    }

    this.setOption(isOn);
  }

  setOption(isOn) {
    console.log('isOn', isOn);
    this.setState({
      showOption: !!isOn
    });
  }

  onLeave() {
    Rtc.leaveChannel();
    route('/')
  }

  renderOption() {
    console.log('this.state.showOption', this.state.showOption);
    return this.state.showOption ? (
      <Option onConfirm={e => this.toggleOption(false)} />
    ) : (
      <OptionMini
        onClick={e => this.toggleOption(true)}
        onLeave={this.onLeave}
      />
    );
  }

  render() {
    console.log('Live props', this.props);
    return (
      <div>
        {this.renderOption()}

        <div className="preview" id="video-preview">
          <div
            className="preview-item"
            ref={node => {
              this.nodeLocal = node;
            }}
            id="local-video"
          />
          <div
            className="preview-item-remote"
            ref={node => {
              this.nodeRemote = node;
            }}
            id="remote-video"
          />
        </div>
      </div>
    );
  }
}

Live.prototype = Object.assign(Live.prototype, Ext);

export default Live;
// // 定义组件默认的属性值(如果父组见没有传递数据，使用默认数据)
// SdkMonitor.defaultProps = {
//   subTitles: [],
//   title: '测试title',
//   echarts: [],
// };
// // 校验从父组件传递的属性值是否符合
// SdkMonitor.propTypes = {
//   subTitles: PropTypes.array,
//   echarts: PropTypes.array,
// };
