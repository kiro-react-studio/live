/*
 * @Author: lduoduo 
 * @Date: 2018-01-13 23:44:01 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-25 19:26:48
 * 默认配置项导出
 */
window.WebRTC = window.WebRTC || window.NRTC;
import myConfig from 'data';
import { Storage } from 'util';

export default {
  commonInfo: {
    inited: false
  },
  roomInfo: {
    // 直播间列表
    roomList: {},
    // 当前直播间的角色
    role: 0,
    // 当前用户id
    uid: getUid(),
    // 当前直播间名字
    roomName: null,
    // 当前主播的uid,
    hostUid: null,
    // 当前房间成员列表
    userList: [],
    // 当前房间麦序队列
    micQueue: []
    //
  },
  rtcInfo: {
    env: 'DEV',
    // 默认会议场景
    scene: 1,
    appKey: myConfig.DEV.appKey,
    token: null,
    requestUrl: myConfig.DEV.requestUrl,
    websocket_rtc: myConfig.DEV.websocket.rtc,
    wssArr: [],
    // channelName: Math.floor(Math.random() * 10000),
    channelName: '',
    channelId: '',
    uid: getUid(),
    type: WebRTC.NETCALL_TYPE_VIDEO,
    role: 0,
    sessionMode: 'meeting',
    isDispatcher_rtc: true,
    autoStart: true,
    audioSelf: false,
    autoSwitchCallMode: false,
    rtmpUrl: myConfig.rtmpUrl,
    webrtc: null,
    sessionConfig: {
      videoQuality: WebRTC.CHAT_VIDEO_QUALITY_480P,
      videoFrameRate: WebRTC.CHAT_VIDEO_FRAME_RATE_20,
      videoBitrate: 0,
      highAudio: false,
      liveEnable: true,
      rtmpUrl: myConfig.rtmpUrl,
      rtmpRecord: true,
      splitMode: WebRTC.LAYOUT_SPLITLATTICETILE
    },
    videoViewSize: {
      width: document.body.clientWidth,
      height: document.body.clientHeight
    },
    videoViewRemoteSize: {
      width: Math.floor(document.body.clientWidth / 5),
      height: Math.floor(document.body.clientWidth / 6)
    },
    videoDevices: [],
    videoDevice: {},
    microDevices: [],
    microDevice: {},
    cameraEnable: true,
    microEnable: true,
    nodeRemote: null,
    nodeLocal: null,
    calling: false,
    beCalling: false,
    playVolume: 255,
    captureVolume: 255
  }
};
// 获取当前uid
function getUid() {
  var uid = Storage.get('uid');
  // if (!uid) {
  //   uid = Math.random() + '';
  //   uid = uid.slice(-9, -1);
  //   Storage.set('uid', uid);
  // }
  return uid;
}
