import { h, Component } from 'preact';
import {
  Page,
  PageBody,
  PageHeader
} from 'layout';

import { Alert } from 'util';

export default class Video extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    console.log('Video loaded');
    this.init();
  }

  componentWillUnmount() {
    console.log('Video going to unload');
    const stream = this.nodeLocal.srcObject
    stream && stream.getTracks().map(track => {
      track.stop()
    })
  }

  init() {
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then(stream => {
        this.nodeLocal.srcObject = stream;
      })
      .catch(err => {
        Alert({
          msg: `开启设备失败: ${err.message || err.name}`
        })
        console.error(err);
      });
  }

  render() {
    console.log('Video props', this.props);
    return (
      <Page page="home">
        <PageHeader title="本地视频预览" options={[{}, {}]} />
        <PageBody>
          <div className="preview" id="video-preview">
            <div className="preview-item">
              <video
                x-webkit-airplay="x-webkit-airplay"
                playsinline="playsinline"
                webkit-playsinline="webkit-playsinline"
                poster="//lduoduo.github.io/public/img/icon.png"
                preload="auto"
                autoplay="autoplay"
                controls={false}
                style={{ height: '100vh' }}
                ref={node => {
                  this.nodeLocal = node;
                }}
                id="local-video"
              />
            </div>
          </div>
        </PageBody>
      </Page>
    );
  }
}
