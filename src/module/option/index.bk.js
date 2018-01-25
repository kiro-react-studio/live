import { h, Component } from 'preact';
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

import { Accordion } from 'layout';

import { Rtc } from 'flow';
import { Config } from 'util';
import { RtcConfig } from 'store.action';
const Status = RtcConfig.data;

// 测试
window.RtcConfig = RtcConfig;

@observer
export default class Option extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log('Option loaded');
    this.init();
  }

  componentWillUnmount() {
    console.log('Option going to unload');
  }

  onEnvChange() {}
  onChange = (e, name, type) => {
    console.log('chnage e:->', e, name, type);
    const fn = `set${name}`;
    RtcConfig[fn](e.target.value);

    if (name === 'AudioSelf') {
      e.target.value
        ? Rtc.startDeviceAudioOutLocal()
        : Rtc.stopDeviceAudioOutLocal();
    }
  };

  init() {
    console.log('checkCompatibility');
    Rtc.checkCompatibility().then(data => {
      console.log(data);
      this.setState({
        rtcSupports: data
      });
    });
  }

  renderRole() {
    return (
      Status.scene === 2 && (
        <div>
          <WeuiCellsTitle>角色</WeuiCellsTitle>
          <WeuiRadioGroup
            name="role"
            items={Config.role}
            value={Status.role}
            onChange={e => this.onChange(e, 'Role', 'radio')}
          />
        </div>
      )
    );
  }
  renderRtmp() {
    return (
      Status.role === 0 && (
        <div>
          <WeuiCellsTitle>推流地址</WeuiCellsTitle>
          <WeuiCells>
            <WeuiCell>
              <WeuiCellBody>
                <WeuiInput
                  placeholder="请输入推流地址"
                  value={Status.rtmpUrl}
                  onChange={e => this.onChange(e, 'RtmpUrl', 'input')}
                />
              </WeuiCellBody>
            </WeuiCell>
          </WeuiCells>
        </div>
      )
    );
  }

  renderDevice() {
    return (
      (/[02]/.test(Status.role) || Status.scene === 1) && (
        <div>
          <WeuiCellsTitle>开关</WeuiCellsTitle>
          <WeuiCells>
            <WeuiCell>
              <WeuiCellBody>耳返</WeuiCellBody>
              <WeuiCellFooter>
                <WeuiSwitch
                  name="audio-self"
                  value={Status.audioSelf}
                  onChange={e => this.onChange(e, 'AudioSelf', 'checkbox')}
                />
              </WeuiCellFooter>
            </WeuiCell>
          </WeuiCells>

          <WeuiCellsTitle>摄像头</WeuiCellsTitle>
          <WeuiRadioGroup
            name="camera"
            items={Status.videoDevices}
            value={Status.videoDevice.deviceId}
            option={{ label: 'label', value: 'deviceId' }}
            onChange={e => this.onChange(e, 'Camera', 'radio')}
          />

          <WeuiCellsTitle>麦克风</WeuiCellsTitle>
          <WeuiRadioGroup
            name="micro"
            items={Status.microDevices}
            value={Status.microDevice.deviceId}
            option={{ label: 'label', value: 'deviceId' }}
            onChange={e => this.onChange(e, 'Micro', 'radio')}
          />
        </div>
      )
    );
  }
  render() {
    const option = Status.calling ? [{ click: this.props.onConfirm }] : [{}];
    return (
      <Page page="home setting">
        <PageHeader title="设置" options={option} />
        <PageBody spacing={false}>
          <Accordion
            icon={true}
            title="查看当前音视频兼容性"
            items={this.state.rtcSupports}
          />

          <WeuiCellsTitle>环境</WeuiCellsTitle>
          <WeuiRadioGroup
            name="env"
            items={Config.env}
            value={Status.env}
            onChange={e => this.onChange(e, 'Env', 'radio')}
          />

          <WeuiCellsTitle>场景</WeuiCellsTitle>
          <WeuiRadioGroup
            name="scene"
            items={Config.scene}
            value={Status.scene}
            onChange={e => this.onChange(e, 'Scene', 'radio')}
          />

          {this.renderRole()}

          <WeuiCellsTitle>房号</WeuiCellsTitle>
          <WeuiCells>
            <WeuiCell>
              <WeuiCellBody>
                <WeuiInput
                  placeholder="请输入房号"
                  value={Status.channelName}
                  onChange={e => this.onChange(e, 'ChannelName', 'input')}
                />
              </WeuiCellBody>
            </WeuiCell>
          </WeuiCells>

          {this.renderRtmp()}

          {this.renderDevice()}

          <div className="page__bd_spacing weui-btn-group">
            <WeuiButton theme="primary" onClick={this.props.onConfirm}>
              {Status.calling ? '确定' : '开始'}
            </WeuiButton>
          </div>
        </PageBody>
      </Page>
    );
  }
}
