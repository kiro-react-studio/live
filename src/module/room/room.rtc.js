/*
 * @Author: lduoduo 
 * @Date: 2018-01-07 19:56:05 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-26 00:50:16
 * 
 * room的扩展脚本，主要融合rtc
 */
import { route } from 'preact-router';
import { Rtc } from 'flow';
import { Ajax, Alert } from 'util';

// 引入状态管理模块
import { RtcConfig } from 'store.action';
const RtcStatus = RtcConfig.data;

export default {
  initRtc() {
    RtcConfig.setChannelName(this.props.roomId);
    Rtc.init();
    this.initRtcEvent();
    this.joinRtc()
      .then(() => {
        RtcConfig.setCalling(true);
      })
      .catch(err => history.back());
  },
  initRtcEvent() {
    const that = this;
    Rtc.on('signalClosed', () => {
      Alert({
        msg: '音视频通信断开，请重新加入',
        btns: [
          {
            content: '重新加入',
            fn: function() {
              that.joinRtc();
            }
          },
          {
            content: '退出房间',
            fn: function() {
              that.leaveRoom();
              that.leaveRtc();
              route('/');
            }
          }
        ]
      });
    });
  },
  joinRtc() {
    if (RtcStatus.calling) {
      return Promise.resolve();
    }
    if (!RtcStatus.channelName) {
      Alert({
        msg: '请输入房间号'
      });
      return Promise.reject();
    }
    return this.getCid()
      .then(() => {
        var config = {
          role: /[02]/.test(RtcStatus.role) ? 0 : 1,
          type: RtcStatus.type,
          uid: RtcStatus.uid,
          sessionMode: RtcStatus.sessionMode
        };

        if (RtcStatus.scene === 2 && !config.role) {
          config.sessionConfig = RtcStatus.sessionConfig;
          if (RtcStatus.role == 2) {
            config.sessionConfig.rtmpUrl = '';
          }
        }

        config.appKey = RtcStatus.appKey;
        config.token = RtcStatus.token;
        config.cid = RtcStatus.channelId;
        config.wssArr = RtcStatus.wssArr;

        Rtc.joinChannel(config);
      })
      .catch(err => {
        console.log('err', err);
        Alert({
          msg: err.stack || err
        });
        that.leaveRoom();
        return Promise.reject();
      });
  },
  // 自己写的ajax好像没有起作用
  getCid1: function() {
    var mode = RtcStatus.sessionMode === 'meeting' ? 2 : 1;
    var curtime = Date.now();
    var str = RtcStatus.appKey + '.' + RtcStatus.uid + '.' + curtime;
    var checksum = md5(str);
    console.log(curtime);
    console.log(checksum);
    var param = {
      uid: RtcStatus.uid,
      channelName: RtcStatus.channelName,
      osType: 4,
      secureType: 2,
      version: '3.8.0',
      netType: 4,
      mode,
      appkey: RtcStatus.appKey,
      curtime,
      checksum,
      webrtc: 1
    };

    console.log('getCid', RtcStatus.requestUrl);

    return Ajax({
      type: 'post',
      url: RtcStatus.requestUrl,
      data: param
    }).then(data => {
      data = data.data;
      console.log('getCid token:', data.cid, data.token);
      RtcConfig.setStatus({
        channelId: data.cid,
        token: data.token
      });
      RtcConfig.setWssArr(data.ips && data.ips.webrtcarray);
    });
  },
  getCid: function() {
    var mode = RtcStatus.sessionMode === 'meeting' ? 2 : 1;
    var curtime = Date.now();
    var str = RtcStatus.appKey + '.' + RtcStatus.uid + '.' + curtime;
    var checksum = md5(str);
    console.log(curtime);
    console.log(checksum);
    var param = {
      uid: RtcStatus.uid,
      channelName: RtcStatus.channelName,
      osType: 4,
      secureType: 2,
      version: '3.8.0',
      netType: 4,
      mode,
      appkey: RtcStatus.appKey,
      curtime,
      checksum,
      webrtc: 1
    };

    console.log('getCid', RtcStatus.requestUrl);

    return axios.post(RtcStatus.requestUrl, Qs.stringify(param)).then(data => {
      data = data.data;
      console.warn('getCid uid:', RtcStatus.uid);
      console.warn('getCid token:', data.cid, data.token);
      if (!data.cid || !data.token)
        return Promise.reject('进入房间失败: 获取cid失败');
      RtcConfig.setStatus({
        channelId: data.cid,
        token: data.token
      });
      RtcConfig.setWssArr(data.ips && data.ips.webrtcarray);
    });
  },
  leaveRtc() {
    Rtc.leaveChannel();
  }
};
