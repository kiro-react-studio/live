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

import { Accordion } from 'layout';

import { Rtc } from 'flow';
import { Config } from 'util';
import { RtcConfig, CommonConfig } from 'store.action';

const RtcStatus = RtcConfig.data;
const CommonStatus = CommonConfig.data;

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

  render() {
    const option = RtcStatus.calling ? [{ click: this.props.onConfirm }] : [{}];
    return (
      <Page page="home setting">
        <PageHeader title="设置" options={option} />
        <PageBody spacing={false}>
          <Accordion
            icon={true}
            title="查看当前音视频兼容性"
            items={this.state.rtcSupports}
          />

          <WeuiCellsTitle>主播推流地址</WeuiCellsTitle>
          <WeuiCells>
            <WeuiCell>
              <WeuiCellBody>
                <WeuiInput
                  placeholder="请输入推流地址"
                  value={RtcStatus.rtmpUrl}
                  onChange={e => this.onChange(e, 'RtmpUrl', 'input')}
                />
              </WeuiCellBody>
            </WeuiCell>
          </WeuiCells>

          <WeuiCellsTitle>开关</WeuiCellsTitle>
          <WeuiCells>
            <WeuiCell>
              <WeuiCellBody>耳返</WeuiCellBody>
              <WeuiCellFooter>
                <WeuiSwitch
                  name="audio-self"
                  value={RtcStatus.audioSelf}
                  onChange={e => this.onChange(e, 'AudioSelf', 'checkbox')}
                />
              </WeuiCellFooter>
            </WeuiCell>
            <WeuiCell>
              <WeuiCellBody>摄像头</WeuiCellBody>
              <WeuiCellFooter>
                <WeuiSwitch
                  name="camera-enable"
                  value={RtcStatus.cameraEnable}
                  onChange={e => this.onChange(e, 'CameraEnable', 'checkbox')}
                />
              </WeuiCellFooter>
            </WeuiCell>
            <WeuiCell>
              <WeuiCellBody>麦克风</WeuiCellBody>
              <WeuiCellFooter>
                <WeuiSwitch
                  name="micro-enable"
                  value={RtcStatus.microEnable}
                  onChange={e => this.onChange(e, 'MicroEnable', 'checkbox')}
                />
              </WeuiCellFooter>
            </WeuiCell>
          </WeuiCells>

          <WeuiCellsTitle>摄像头</WeuiCellsTitle>
          <WeuiRadioGroup
            name="camera"
            items={RtcStatus.videoDevices}
            value={RtcStatus.videoDevice.deviceId}
            option={{ label: 'label', value: 'deviceId' }}
            onChange={e => this.onChange(e, 'Camera', 'radio')}
          />

          <WeuiCellsTitle>麦克风</WeuiCellsTitle>
          <WeuiRadioGroup
            name="micro"
            items={RtcStatus.microDevices}
            value={RtcStatus.microDevice.deviceId}
            option={{ label: 'label', value: 'deviceId' }}
            onChange={e => this.onChange(e, 'Micro', 'radio')}
          />

          <div className="page__bd_spacing weui-btn-group" />
        </PageBody>
      </Page>
    );
  }
}
