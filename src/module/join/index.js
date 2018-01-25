/*
 * @Author: lduoduo 
 * @Date: 2018-01-19 00:07:51 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-21 22:59:11
 * 加入房间前的选项选择
 */
import { h, Component } from 'preact';
import { route } from 'preact-router';
import { observer } from 'mobx-preact';

import { Page, PageBody, PageHeader } from 'layout';

import WeuiSwitch from 'weui/switch';
import WeuiInput from 'weui/input';
import WeuiRadioGroup from 'weui/radio-group';
import WeuiButton from 'weui/button';
import {
  WeuiCells,
  WeuiCell,
  WeuiLink,
  WeuiCellsTitle,
  WeuiCellBody,
  WeuiCellFooter
} from 'weui/cells';

import { Alert } from 'util';
// 引入本页面的扩展模块
import ExtJoin from './join.ext';

import { Rtc } from 'flow';
import { Config } from 'util';
import { RtcConfig, CommonConfig, RoomConfig } from 'store.action';

const RtcStatus = RtcConfig.data;
const CommonStatus = CommonConfig.data;
const RoomStatus = RoomConfig.data;

// 测试
window.RtcConfig = RtcConfig;

@observer
export default class Option extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log('Join loaded');
    this.init();
  }

  componentWillUnmount() {
    console.log('Join going to unload');
  }

  onEnvChange() {}
  onChange = (e, name, type) => {
    console.log('chnage e:->', e, name, type);
    const fn = `set${name}`;
    RtcConfig[fn] &&  RtcConfig[fn](e.target.value);
    RoomConfig[fn] && RoomConfig[fn](e.target.value);

    if (name === 'AudioSelf') {
      e.target.value
        ? Rtc.startDeviceAudioOutLocal()
        : Rtc.stopDeviceAudioOutLocal();
    }
  };

  init() {
    if (!CommonStatus.inited) {
      return route('/');
    }
    console.log('checkCompatibility');
    Rtc.checkCompatibility().then(data => {
      console.log(data);
      this.setState({
        rtcSupports: data
      });
    });
  }

  onConfirm = () => {
    const fn = +this.props.flag === 0 ? 'create' : 'join';
    ExtJoin[fn]()
      .then(data => {
        console.log('data', data);
        route(`/room?roomId=${data.roomId}`);
      })
      .catch(err => {
        if(err.constructor === Object){
          err.msg = `${fn}房间失败`
        } else {
          err = `${fn}房间失败` + err.toString()
        }
        console.error(err)
        Alert({ msg: err });
      });
  };

  renderRole() {
    return (
      RtcStatus.scene === 2 && (
        <div>
          <WeuiCellsTitle>角色</WeuiCellsTitle>
          <WeuiRadioGroup
            name="role"
            items={Config.role}
            value={RtcStatus.role}
            onChange={e => this.onChange(e, 'Role', 'radio')}
          />
        </div>
      )
    );
  }

  renderSence() {
    return + this.props.flag === 0 && (
      <div>
        <WeuiCellsTitle>场景</WeuiCellsTitle>
        <WeuiRadioGroup
          name="scene"
          items={Config.scene}
          value={RtcStatus.scene}
          onChange={e => this.onChange(e, 'Scene', 'radio')}
        />
      </div>
    );
  }
  render() {
    const option = RtcStatus.calling ? [{ click: this.props.onConfirm }] : [{}];
    return (
      <Page page="home setting">
        <PageHeader title="请选择" options={option} />
        <PageBody spacing={false}>
          {this.renderSence()}
          {this.renderRole()}

          <WeuiCellsTitle>房号</WeuiCellsTitle>
          <WeuiCells>
            <WeuiCell>
              <WeuiCellBody>
                <WeuiInput
                  placeholder="请输入房号"
                  value={RtcStatus.channelName}
                  onChange={e => this.onChange(e, 'ChannelName', 'input')}
                />
              </WeuiCellBody>
            </WeuiCell>
          </WeuiCells>

          <div className="page__bd_spacing weui-btn-group">
            <WeuiButton theme="primary" onClick={this.onConfirm}>
              {RtcStatus.calling ? '确定' : '开始'}
            </WeuiButton>
          </div>
        </PageBody>
      </Page>
    );
  }
}
