/*
 * @Author: lduoduo 
 * @Date: 2018-01-13 23:37:00 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-25 21:02:24
 * 进入直播间
 */
import { h, Component } from 'preact';
import { observer } from 'mobx-preact';

import { Page, PageBody, Accordion, PageFooter, PageHeader } from 'layout';
import { route } from 'preact-router';

import { Alert } from 'util';

// 引入本页面的扩展模块
import ExtRoom from './room.room';
import ExtRtc from './room.rtc';

// 引入状态管理模块
import { RoomConfig, RtcConfig } from 'store.action';
const RoomStatus = RoomConfig.data;
const RtcStatus = RtcConfig.data;

@observer
class RoomDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log('room loaded');
    console.log('room.props', this.props);
    this.init();
  }

  componentWillUnmount() {
    console.log('room going to unload');
  }

  _click = e => {
    console.log('route ', e);
    route(e);
  };

  onSetting = () => {
    route('setting');
  };

  onExit = () => {
    this.leaveRtc();
    this.leaveRoom();
    history.back();
  };

  init() {
    // 更新node节点
    RtcConfig.setNodeLocal(this.nodeLocal);
    RtcConfig.setNodeRemote(this.nodeRemote);

    if (!this.props.roomId) {
      // 房间号不存在，报警
      Alert({
        msg: '啊哦！房间好像不存在！'
      });
      route('/');
      return;
    }
    // 加入房间

    this.join();

    // if (!RtcStatus.calling) {
    //   // 开始直播
    //   return this.joinChannel()
    //     .then(() => {
    //       RtcConfig.setCalling(true);
    //     })
    //     .catch(err => err && console.error(err));
    // }
  }

  join() {
    RoomConfig.setChannelName(this.props.roomId);
    this.initRoom()
      .then(() => this.initRtc())
      .catch(err => {
        if (err.constructor === Object) {
          err.msg = '加入房间失败';
        }
        err = err + '加入房间失败';
        Alert({
          msg: err
        });
        this.leaveRtc();
        this.leaveRoom();
        route('/');
      });
  }
  // // 初始化加入rtc房间
  // initRtc() {

  // }

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
    const option = [
      {
        icon: 'icon-shezhi',
        click: this.onSetting
      },
      {
        icon: 'icon-icon--3',
        click: this.onExit
      }
    ];
    // if (!RtcStatus.calling) {
    //   option[0] = {
    //     icon: 'icon-shezhi',
    //     click: this.onSetting
    //   };
    //   option[1] = {
    //     icon: 'icon-icon--3',
    //     click: this.onExit
    //   };
    // }
    console.log('options', option);
    return (
      <Page page="home">
        <PageHeader title="直播间" options={option} />
        <PageBody>
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
        </PageBody>
        <PageFooter />
      </Page>
    );
  }
}

RoomDetail.prototype = Object.assign(RoomDetail.prototype, ExtRoom);
RoomDetail.prototype = Object.assign(RoomDetail.prototype, ExtRtc);

export default RoomDetail;

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
