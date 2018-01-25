/*
 * @Author: lduoduo 
 * @Date: 2018-01-13 23:37:00 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-25 23:23:32
 * 直播间列表展示
 */
import { h, Component } from 'preact';
import { observer } from 'mobx-preact';
import { route } from 'preact-router';

import { Page, PageBody, Accordion, PageFooter, PageHeader } from 'layout';
import {
  WeuiCells,
  WeuiCell,
  WeuiLink,
  WeuiCellsTitle,
  WeuiCellBody,
  WeuiCellFooter
} from 'weui/cells';
import WeuiInput from 'weui/input';
import WeuiRadioGroup from 'weui/radio-group';
import WeuiSwitch from 'weui/switch';
import WeuiButton from 'weui/button';

// 引入房间功能模块
import { Room } from 'flow';

// 引入状态管理模块
import { RoomConfig, CommonConfig } from 'store.action';
const RoomStatus = RoomConfig.data;
const CommonStatus = CommonConfig.data;

@observer
export default class RoomList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log('roomlist loaded');
    this.init();
  }

  componentWillUnmount() {
    console.log('roomlist going to unload');
  }

  _click = e => {
    const url = `room?roomId=${e}`;
    console.log('route ', url);
    route(url);
  };

  init() {
    Room.init();
  }

  render() {
    console.log('RoomStatus.roomList', RoomStatus.roomList);
    const option = CommonStatus.inited
      ? [{}, {}]
      : [{ icon: null, click: null }, {}];
    return (
      <Page page="home">
        <PageHeader title="直播列表" options={option} />
        <PageBody>
          {Object.keys(RoomStatus.roomList).map((key, index) => (
            <Accordion
              icon="icon-live_icon"
              title={RoomStatus.roomList[key].roomName}
              desc={`${RoomStatus.roomList[key].count}人`}
              onClick={() => this._click(key)}
            />
          ))}
        </PageBody>
      </Page>
    );
  }
}

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
