import { h, Component } from 'preact';
import { route } from 'preact-router';

import { Page, PageBody, Accordion, PageFooter, PageHeader } from 'layout';
import { Tab, TabHeader, TabBody, TabBarItem } from 'weui/tab';

import { Rtc, Room } from 'flow';
import { CommonConfig } from 'store.action';

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log('home loaded');
    this.init();
  }

  componentWillUnmount() {
    console.log('home going to unload');
  }

  _click = e => {
    console.log('route ', e);
    route(e);
  };

  init() {
    CommonConfig.setInited(true);
    Rtc.init();
    Room.init();
  }

  join(flag) {
    route(`/join?flag=${flag}`);
  }

  render() {
    console.log('home props', this.props);
    return (
      <Page page="home">
        <PageHeader title="hello" />
        <PageBody>
          <Accordion
            icon="icon-xiangji"
            title="video"
            desc="本地测试视频预览"
            onClick={this._click}
          />

          <Accordion
            icon="icon-shezhi"
            title="setting"
            desc="设置"
            onClick={this._click}
          />
          <Accordion
            icon="icon-live_icon"
            title="room"
            desc="进入房间"
            onClick={this._click}
          />
          <Accordion
            icon="icon-weibiaoti1"
            title="roomlist"
            desc="直播间列表"
            onClick={this._click}
          />
        </PageBody>

        <PageFooter bottom>
          <Tab>
            <TabHeader>
              <TabBarItem onClick={()=>this.join(0)}>创建房间</TabBarItem>
              <TabBarItem onClick={()=>this.join(1)}>加入房间</TabBarItem>
            </TabHeader>
          </Tab>
        </PageFooter>
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
