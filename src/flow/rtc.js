/*
 * @Author: lduoduo 
 * @Date: 2018-01-07 15:49:41 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-26 00:55:05
 * rtc功能合集，输出单实例，引用了mobx状态管理
 * 组件调用方式:
 * 1. import {Rtc} from 'flow'
 * 2. 注册事件完成监听，在对应的目标组件上做出对应的UI处理，事件如下
 *      - hangup: 挂掉通话
 *      - calling: 主叫呼叫中
 *      - beCalling: 被叫呼叫中
 *      - sessionStarted: 会话开始
 */

window.WebRTC = window.WebRTC || window.NRTC;
import { Events, Pipes } from 'util';

import { RtcConfig, RoomConfig } from 'store.action';
const Status = RtcConfig.data;
const RoomStatus = RoomConfig.data;

const event = new Events();

// 页面上的功能合集模块: webrtc, 输出单实例
let rtc = {
  webrtc: null,
  init: function() {
    if (this.webrtc) {
      return;
    }
    window.myWebrtc = this.webrtc = WebRTC.getInstance({
      debug: true
    });
    this.initEvent();
    this.getDevices();
    this.initPlatform();
    return this.webrtc;
  },
  reset: function() {
    this.stopLocalStream();
    this.stopRemoteStream();
    this.stopDeviceAudioIn();
    this.stopDeviceAudioOutLocal();
    this.stopDeviceAudioOutChat();
    this.stopDeviceVideo();
  },
  initPlatform: function() {
    // 针对chrome mobile小改
    console.log(platform);
    if (/chrome/gi.test(window.platform.name)) {
      window.platform.name = 'Chrome';
    }
    // if (/safari/gi.test(window.platform.name)) {
    //   window.platform.name = 'Firefox';
    // }
  },
  initEvent: function() {
    var that = this;
    var webrtc = this.webrtc;
    webrtc.on('deviceStatus', this.getDevices.bind(this));
    webrtc.on('devices', function(obj) {
      console.log('on devices', obj);
    });
    webrtc.on('signalClosed', function(obj) {
      console.log('on signalClosed', obj);
      RtcConfig.setCalling(false);
      webrtc.leaveChannel();
      that.emit('signalClosed');
    });
    webrtc.on('sessionConnected', function(obj) {
      console.log('on sessionConnected', obj);
      RtcConfig.setCalling(true);
    });
    webrtc.on('beCalling', function(obj) {
      console.log('音视频 on beCalling', obj);
      var channelId = obj.channelId;
      webrtc.control({
        channelId: channelId,
        command: WebRTC.webrtc_CONTROL_COMMAND_START_NOTIFY_RECEIVED
      });
      // 只有在没有通话并且没有被叫的时候才记录被叫信息, 否则通知对方忙并拒绝通话
      if (!webrtc.calling && !Status.beCalling) {
        RtcConfig.setStatus({
          type: obj.type,
          beCalling: true,
          beCalledInfo: obj,
          method: 'rtc'
        });
      } else {
        var busy = false;
        if (webrtc.calling) {
          busy = webrtc.notCurrentChannelId(obj);
        } else if (Status.beCalling) {
          busy = Status.beCalledInfo.channelId !== channelId;
        }
        if (busy) {
          webrtc.control({
            channelId: channelId,
            command: WebRTC.webrtc_CONTROL_COMMAND_BUSY
          });
          webrtc.response({
            accepted: false,
            beCalledInfo: obj
          });
        }
      }

      this.callTimer = setTimeout(function() {
        if (!Status.callAccepted && Status.beCalling) {
          console.log('超时未接听, hangup');
          that.emit('hangup');
        }
      }, 1000 * 30);
    });
    webrtc.on('callRejected', function(obj) {
      console.log('on callRejected', obj);
      that.stopLocalStream();
      that.stopRemoteStream();
      that.emit('hangup');
      //   home.resetWhenHangup();
      //   home.clearCallTimer();
    });
    webrtc.on('callAccepted', function(obj) {
      RtcConfig.setStatus({
        type: obj.type,
        calling: true,
        callAccepted: true
      });
      console.log('on callAccepted', obj);
      //   home.clearCallTimer();
      if (!Status.isDispatcher_rtc) {
        obj.wssArr = Status.websocket_rtc;
      }
      that.startSession(obj);
    });
    webrtc.on('joinChannel', function(obj) {
      console.log('user join', obj);
      that.startDeviceAudioOutChat();
    });
    webrtc.on('remoteTrack', function(obj){
      obj.track.kind === 'video' && that.startRemoteStream(obj)
    })
    webrtc.on('leaveChannel', function(obj) {
      console.log('sb leaveChannel', obj);
      var param = {};
      if (obj.account) {
        param.account = obj.account;
      }
      if (obj.uid) {
        param.uid = obj.uid;
      }
      that.webrtc.stopRemoteStream(param);
      // 如果是p2p模式，直接挂断电话
      if (that.webrtc.sessionMode === 'p2p') {
        that.emit('hangup');
        // home.hangup && home.hangup();
      }
    });
    webrtc.on('deviceStatus', function(obj) {
      console.log('on deviceStatus', obj);
    });
    webrtc.on('deviceAdd', function(obj) {
      console.log('on deviceAdd', obj);
      var temp = that.webrtc;
      if (!temp.signalInited) return;
      /* 如果当前正在通话中，并且没有设备，插上设备后重新传输数据¸ */
      if (
        !temp.devices.hasAudio &&
        (temp.devices.needVideo || temp.devices.needAudio)
      ) {
        var promise;
        if (temp.type === WebRTC.NETCALL_TYPE_VIDEO) {
          promise = that.startDeviceVideo();
        } else {
          promise = that.stopDeviceVideo();
        }

        promise
          .then(function() {
            return that.startDeviceAudioIn();
          })
          .then(function() {
            that.setCaptureVolume();
          })
          .then(function() {
            return that.startDeviceAudioOutChat();
          })
          .then(function() {
            that.setVideoViewSize();
          })
          .catch(function(e) {
            console.log('操作失败');
            console.error(e);
          });
      }
    });
    webrtc.on('deviceRemove', function(obj) {
      console.log('on deviceRemove', obj);
      !that.webrtc.devices.hasVideo &&
        that.webrtc.control({
          command: WebRTC.webrtc_CONTROL_COMMAND_SELF_CAMERA_INVALID
        });
    });
    webrtc.on('streamResize', function(obj) {
      console.log('on streamResize', obj);
    });
    webrtc.on('remoteStreamResize', function(obj) {
      console.log('on remoteStreamResize', obj);
    });
    webrtc.on('callerAckSync', function(obj) {
      console.log('on callerAckSync', obj);
      if (
        Status.beCalledInfo &&
        obj.channelId === Status.beCalledInfo.channelId
      ) {
        RtcConfig.setStatus({
          beCalledInfo: null,
          beCalling: false
        });
      }
    });
    webrtc.on('netStatus', function(obj) {
      RtcConfig.setStatus({
        netStatus: Object.assign({}, Status.netStatus, obj)
      });
    });
    webrtc.on('statistics', function(obj) {
      RtcConfig.setStatus({
        statistics: obj
      });
      // console.log('statistics: ', obj)
    });
    webrtc.on('audioVolume', function(obj) {
      RtcConfig.setStatus({
        audioVolumn: obj
      });
    });

    webrtc.on('recordMp4', function(obj) {
      console.log('recordMp4 通知', obj);
    });
    webrtc.on('control', function(obj) {
      // 如果不是当前通话的指令, 直接丢掉
      if (webrtc.notCurrentChannelId(obj)) {
        return;
      }
      console.log('on control', obj);
      // 切音频
      if (obj.type === WebRTC.webrtc_CONTROL_COMMAND_SWITCH_VIDEO_TO_AUDIO) {
        that.switchVideoToAudio();
      }
      // 切视频
      if (obj.type === WebRTC.webrtc_CONTROL_COMMAND_SWITCH_VIDEO_TO_AUDIO) {
        that.switchVideoToAudio();
      }
    });
    webrtc.on('control', function(obj) {
      // 如果不是当前通话的指令, 直接丢掉
      if (webrtc.notCurrentChannelId(obj)) {
        return;
      }
      console.log('on control', obj);
      var type = obj.type;
      switch (type) {
        // webrtc_CONTROL_COMMAND_NOTIFY_AUDIO_ON 通知对方自己打开了音频
        case WebRTC.webrtc_CONTROL_COMMAND_NOTIFY_AUDIO_ON:
          console.log('对方打开了音频');
          break;
        // webrtc_CONTROL_COMMAND_NOTIFY_AUDIO_OFF 通知对方自己关闭了音频
        case WebRTC.webrtc_CONTROL_COMMAND_NOTIFY_AUDIO_OFF:
          console.log('对方关闭了音频');
          break;
        // webrtc_CONTROL_COMMAND_NOTIFY_VIDEO_ON 通知对方自己打开了视频
        case WebRTC.webrtc_CONTROL_COMMAND_NOTIFY_VIDEO_ON:
          console.log('对方打开了视频');
          break;
        // webrtc_CONTROL_COMMAND_NOTIFY_VIDEO_OFF 通知对方自己关闭了视频
        case WebRTC.webrtc_CONTROL_COMMAND_NOTIFY_VIDEO_OFF:
          console.log('对方关闭了视频');
          break;
        // webrtc_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO 请求从音频切换到视频
        // webrtc_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO_REJECT 拒绝从音频切换到视频
        case WebRTC.webrtc_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO:
          var allow =
            Status.autoSwitchCallMode || confirm('是否同意切换视频通话！！');
          if (allow) {
            that.agreeSwitchAudioToVideo();
            RtcConfig.setStatus({
              callType: WebRTC.NETCALL_TYPE_VIDEO
            });
          } else {
            that.rejectSwitchAudioToVideo();
          }
          break;
        // webrtc_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO_AGREE 同意从音频切换到视频
        case WebRTC.webrtc_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO_AGREE:
          that.switchAudioToVideo();
          RtcConfig.setStatus({
            callType: WebRTC.NETCALL_TYPE_VIDEO
          });
          break;
        // webrtc_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO_AGREE 拒绝从音频切换到视频
        case WebRTC.webrtc_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO_REJECT:
          alert('对方拒绝切换视频！！');
          break;
        // webrtc_CONTROL_COMMAND_SWITCH_VIDEO_TO_AUDIO 从视频切换到音频
        case WebRTC.webrtc_CONTROL_COMMAND_SWITCH_VIDEO_TO_AUDIO:
          that.switchVideoToAudio();
          RtcConfig.setStatus({
            callType: WebRTC.webrtc_TYPE_AUDIO
          });
          break;
        // webrtc_CONTROL_COMMAND_BUSY 占线
        case WebRTC.webrtc_CONTROL_COMMAND_BUSY:
          console.log('对方忙');
          break;
        case WebRTC.webrtc_CONTROL_COMMAND_SELF_CAMERA_INVALID:
          console.log('对方摄像头不可用');
          break;
        // webrtc_CONTROL_COMMAND_SELF_CAMERA_INVALID 自己的摄像头不可用
        // webrtc_CONTROL_COMMAND_SELF_ON_BACKGROUND 自己处于后台
        // webrtc_CONTROL_COMMAND_START_NOTIFY_RECEIVED 告诉发送方自己已经收到请求了（用于通知发送方开始播放提示音）
        // webrtc_CONTROL_COMMAND_NOTIFY_RECORD_START 通知对方自己开始录制视频了
        // webrtc_CONTROL_COMMAND_NOTIFY_RECORD_STOP 通知对方自己结束录制视频了
      }
    });
    webrtc.on('error', function(obj) {
      console.log('on error', obj);
    });
    webrtc.on('hangup', function(obj) {
      console.log('音视频on hangup', obj);
      if (
        (Status.beCalledInfo &&
          obj.channelId === Status.beCalledInfo.channelId) ||
        webrtc.isCurrentChannelId(obj)
      ) {
        RtcConfig.setStatus({
          calling: false
        });
        that.emit('hangup');
      }
    });
  },
  checkCompatibility() {
    return WebRTC.checkCompatibility();
  },
  // 直接开启会话
  startwebrtcSession: function(data) {
    this.webrtc.setwebrtcSession(data);
    var param = { role: 0 };
    if (!Status.isDispatcher_rtc) {
      param.wssArr = Status.websocket_rtc;
    }
    this.startSession(param);
  },
  // 开启会话
  startSession: function(param) {
    var that = this;
    param = param || {};
    console.log('开启会话');

    if (!Status.isDispatcher_rtc) {
      param.wssArr = Status.websocket_rtc;
    }

    var promise;

    // if (!Status.autoStart) {
    //   promise = Promise.resolve();
    // } else {
    //   if (param.type === WebRTC.NETCALL_TYPE_VIDEO) {
    //     promise = that.startDeviceVideo();
    //   } else {
    //     promise = that.stopDeviceVideo();
    //   }
    //   promise = promise
    //     .then(function() {
    //       return that.startDeviceAudioIn();
    //     })
    //     .then(function() {
    //       that.setCaptureVolume();
    //       return Promise.resolve();
    //     });
    // }

    const arrFn = [];
    // 自动打开设备
    if (Status.autoStart) {
      if (Status.cameraEnable) {
        arrFn.push(that.startDeviceVideo.bind(that));
      }
      if (Status.microEnable) {
        arrFn.push(that.startDeviceAudioIn.bind(that));
      }
    }

    promise = Pipes(arrFn);
    return promise
      .then(function() {
        console.log('开始webrtc连接', param);
        return that.webrtc.startSession(param);
      })
      .then(function() {
        console.log('webrtc连接成功');
        return that.startDeviceAudioOutChat();
      })
      .then(function() {
        that.setVideoViewSize();
      })
      .catch(function(e) {
        console.log('连接出错', e);
        console.error(e);
        that.reset();
        that.emit('hangup');
      });
  },
  resetWhenHangup: function() {
    this.webrtc.resetWhenHangup();
  },
  createChannel: function(param) {
    var that = this;
    this.webrtc.createChannel(param).then(
      function(obj) {
        console.log('createChannel', obj);
      },
      function(err) {
        console.log('createChannelErr', err);
      }
    );
  },
  joinChannel: function(param) {
    var that = this;
    this.webrtc
      .joinChannel(param)
      .then(function(obj) {
        RtcConfig.setStatus({
          calling: true
        });
        console.log('joinChannel', obj);
        return that.startSession(param);
      })
      .catch(function(err) {
        console.log('joinChannelErr', err);
        that.emit('hangup');
      });
  },
  leaveChannel: function() {
    this.webrtc && this.webrtc.leaveChannel();
    console.log('leaveChannel');
    RtcConfig.setStatus({
      calling: false
    });
  },
  call: function(param) {
    var that = this;
    this.webrtc.getDevicesOfType(WebRTC.DEVICE_TYPE_VIDEO).then(function(obj) {
      that.webrtc.call(param).then(
        function(obj) {
          console.log('call success', obj);
          that.callTimer = setTimeout(function() {
            if (!Satus.callAccepted && Satus.calling) {
              console.log('超时未接听, hangup');
              that.emit('hangup');
            }
          }, 1000 * 30);
        },
        function(err) {
          if (err.code === 11001) {
            console.log('callee offline', err);
            that.emit('hangup');
          }
        }
      );
    });
  },
  reject: function() {
    // 可以先通知对方自己忙, 拒绝的时候需要回传在 `beCalling` 事件里面接收到的对象
    var beCalledInfo = Status.beCalledInfo;
    this.webrtc.control({
      channelId: beCalledInfo.channelId,
      command: WebRTC.webrtc_CONTROL_COMMAND_BUSY
    });
    this.webrtc.response({
      accepted: false,
      beCalledInfo: beCalledInfo
    });
    RtcConfig.setStatus({
      beCalledInfo: null,
      beCalling: false
    });
  },
  accept: function(param) {
    var that = this;
    RtcConfig.setStatus({
      beCalling: false
    });
    return this.webrtc.response(param).catch(function(err) {
      that.reject();
      console.log('接听失败', err);
    });
  },
  hangup: function() {
    console.log('hangup');
    this.webrtc.hangup();
  },
  getDevices: function() {
    this.webrtc
      .getDevicesOfType(WebRTC.DEVICE_TYPE_VIDEO)
      .then(function(devices) {
        devices = devices.devices || devices;
        devices = devices || [{ deviceId: null, label: '-' }];
        console.log('摄像头', devices);
        RtcConfig.setCameraList(devices);
        RtcConfig.setCamera(devices[0]);
      });
    this.webrtc
      .getDevicesOfType(WebRTC.DEVICE_TYPE_AUDIO_IN)
      .then(function(devices) {
        devices = devices.devices || devices;
        devices = devices || [{ deviceId: null, label: '-' }];
        console.log('麦克风', devices);
        RtcConfig.setMicroList(devices);
        RtcConfig.setMicro(devices[0]);
      });
    // 检查扬声器
    this.webrtc
      .getDevicesOfType(WebRTC.DEVICE_TYPE_AUDIO_OUT_CHAT)
      .then(function(devices) {
        console.log('扬声器', devices);
      });
  },
  updateRtmpUrl: function() {
    var that = this;
    this.webrtc.updateRtmpUrl(Status.sessionConfig.rtmpUrl).then(function(obj) {
      console.log('updateRtmpUrl  ' + Status.sessionConfig.rtmpUrl, obj);
    });
  },
  changeRoleToPlayer: function() {
    var that = this;
    this.webrtc
      .changeRoleToPlayer()
      .then(function(obj) {
        // RtcConfig.setStatus({
        //   role: WebRTC.ROLE_PLAYER
        // });
        console.log(obj);
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  changeRoleToAudience: function() {
    this.webrtc
      .changeRoleToAudience()
      .then(function(obj) {
        // RtcConfig.setStatus({
        //   role: WebRTC.ROLE_AUDIENCE
        // });
        console.log(obj);
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  setAudioBlack: function() {
    const param = {};
    if (Status.targetAccount) {
      param.account = Status.targetAccount;
    }
    if (Status.targetUid) {
      param.uid = Status.targetUid;
    }
    this.webrtc
      .setAudioBlack(param)
      .then(function() {
        console.log('setAudioBlack', param);
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  setAudioStart: function() {
    // const param = {}
    // if (Status.targetAccount) {
    //   param.account = Status.targetAccount
    // }
    // if (Status.targetUid) {
    //   param.uid = Status.targetUid
    // }
    this.webrtc
      .setAudioStart(Status.targetAccount || Status.targetUid)
      .then(function() {
        console.log('setAudioStart', Status.targetAccount || Status.targetUid);
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  setVideoBlack: function() {
    this.webrtc
      .setVideoBlack(Status.targetAccount || Status.targetUid)
      .then(function() {
        console.log('setVideoBlack', Status.targetAccount || Status.targetUid);
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  setVideoShow: function() {
    this.webrtc
      .setVideoShow(Status.targetAccount || Status.targetUid)
      .then(function() {
        console.log('setVideoShow', Status.targetAccount || Status.targetUid);
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  startRecordMp4: function() {
    var param = {};
    if (Status.targetAccount) {
      param.account = Status.targetAccount;
    }
    if (Status.targetUid) {
      param.uid = Status.targetUid;
    }
    this.webrtc
      .startRecordMp4(param)
      .then(function(obj) {
        console.log('startRecordMp4 通知下发为正式录制', obj);
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  stopRecordMp4: function() {
    this.webrtc
      .stopRecordMp4({})
      .then(function(obj) {
        console.log('stopRecordMp4 通知下发为正式结束录制', obj);
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  startRecordAac: function() {
    this.webrtc
      .startRecordAac({})
      .then(function(obj) {
        console.log('startRecordAac 通知下发为正式录制');
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  stopRecordAac: function() {
    this.webrtc
      .stopRecordAac()
      .then(function(obj) {
        console.log('stopRecordAac 通知下发为正式结束录制');
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  askSwitchVideoToAudio: function() {
    console.log('切换到音频');
    this.webrtc.control({
      command: WebRTC.webrtc_CONTROL_COMMAND_SWITCH_VIDEO_TO_AUDIO
    });
    this.switchVideoToAudio();
  },
  switchVideoToAudio: function() {
    console.log('切换到视频');
    var webrtc = this.webrtc;
    this.stopDeviceVideo();
    this.stopLocalStream();
    this.stopRemoteStream();
    webrtc.switchVideoToAudio();
  },
  askSwitchAudioToVideo: function() {
    this.webrtc.control({
      command: WebRTC.webrtc_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO
    });
  },
  agreeSwitchAudioToVideo: function() {
    this.webrtc.control({
      command: WebRTC.webrtc_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO_AGREE
    });
    this.switchAudioToVideo();
  },
  rejectSwitchAudioToVideo: function() {
    this.webrtc.control({
      command: WebRTC.webrtc_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO_REJECT
    });
  },
  switchAudioToVideo: function() {
    this.startDeviceVideo()
      .then(
        function() {
          this.webrtc.switchAudioToVideo();
          this.startRemoteStream();
        }.bind(this)
      )
      .catch(function(e) {
        console.log(e);
      });
  },
  startDeviceAudioIn: function() {
    console.log('启动麦克风');
    var that = this;
    return this.webrtc
      .startDevice({
        type: WebRTC.DEVICE_TYPE_AUDIO_IN,
        device: Status.microDevice
      })
      .then(function() {
        console.log('启动麦克风成功');
        // 通知对方自己开启了麦克风
        that.webrtc.control({
          command: WebRTC.webrtc_CONTROL_COMMAND_NOTIFY_AUDIO_ON
        });
        // 判断是否开启耳返
        if (Status.audioSelf) {
          that.startDeviceAudioOutLocal();
        }
      })
      .catch(function(e) {
        console.log('启动麦克风失败', e);
      });
  },
  stopDeviceAudioIn: function() {
    console.log('关闭麦克风');
    var that = this;
    return this.webrtc.stopDevice(WebRTC.DEVICE_TYPE_AUDIO_IN).then(function() {
      console.log('关闭麦克风成功');
      // 通知对方自己关闭了麦克风
      that.webrtc.control({
        command: WebRTC.webrtc_CONTROL_COMMAND_NOTIFY_AUDIO_OFF
      });
    });
  },
  startDeviceAudioOutLocal: function() {
    return this.webrtc
      .startDevice({
        type: WebRTC.DEVICE_TYPE_AUDIO_OUT_LOCAL
      })
      .catch(function() {
        console.log('播放自己的声音失败');
      });
  },
  stopDeviceAudioOutLocal: function() {
    return this.webrtc.stopDevice(WebRTC.DEVICE_TYPE_AUDIO_OUT_LOCAL);
  },
  startDeviceAudioOutChat: function() {
    return this.webrtc
      .startDevice({
        type: WebRTC.DEVICE_TYPE_AUDIO_OUT_CHAT
      })
      .catch(function() {
        console.log('播放对方的声音失败');
      });
  },
  stopDeviceAudioOutChat: function() {
    this.webrtc.stopDevice(WebRTC.DEVICE_TYPE_AUDIO_OUT_CHAT);
  },
  startDeviceVideo: function() {
    var that = this;
    console.log('启动摄像头');
    return this.webrtc
      .startDevice({
        type: WebRTC.DEVICE_TYPE_VIDEO,
        device: Status.videoDevice
      })
      .then(function(e) {
        console.log('启动摄像头成功', e);
        that.startLocalStream();
        // 通知对方自己开启了摄像头
        that.webrtc.control({
          command: WebRTC.webrtc_CONTROL_COMMAND_NOTIFY_VIDEO_ON
        });
      })
      .catch(function(error) {
        console.log('启动摄像头失败');
        // 通知对方自己的摄像头不可用
        that.webrtc.control({
          command: WebRTC.webrtc_CONTROL_COMMAND_SELF_CAMERA_INVALID
        });
        console.log(error.toString());
        console.log(error);
      });
  },
  stopDeviceVideo: function() {
    var that = this;
    console.log('关闭摄像头');
    return this.webrtc.stopDevice(WebRTC.DEVICE_TYPE_VIDEO).then(function() {
      console.log('关闭摄像头成功');
      // 通知对方自己关闭了摄像头
      that.webrtc.control({
        command: WebRTC.webrtc_CONTROL_COMMAND_NOTIFY_VIDEO_OFF
      });
    });
  },
  startDeviceDesktopScreen: function() {
    var that = this;
    return this.webrtc
      .startDevice({
        type: WebRTC.DEVICE_TYPE_DESKTOP_SCREEN
      })
      .then(function() {
        console.log('启动桌面共享成功');
        that.startLocalStream();
      })
      .catch(function(error) {
        console.log('启动桌面共享失败');
        // 通知对方自己的摄像头不可用
        that.webrtc.control({
          command: WebRTC.webrtc_CONTROL_COMMAND_SELF_CAMERA_INVALID
        });
        console.log(error.toString());
        console.log(error);
      });
  },
  startDeviceDesktopWindow: function() {
    var that = this;
    return this.webrtc
      .startDevice({
        type: WebRTC.DEVICE_TYPE_DESKTOP_WINDOW
      })
      .then(function() {
        console.log('启动应用共享成功');
        that.startLocalStream();
      })
      .catch(function(error) {
        console.log('启动应用共享失败');
        // 通知对方自己的摄像头不可用
        that.webrtc.control({
          command: WebRTC.webrtc_CONTROL_COMMAND_SELF_CAMERA_INVALID
        });
        console.log(error.toString());
        console.log(error);
      });
  },
  stopDeviceDesktop: function() {
    this.stopDeviceVideo();
  },
  setVideoViewSize: function() {
    this.webrtc.setVideoViewSize(Status.videoViewSize);
  },
  setVideoViewRemoteSize: function(obj) {
    var param = {};
    if (Status.targetAccount) {
      param.account = Status.targetAccount;
    }
    if (Status.targetUid) {
      param.uid = Status.targetUid;
    }
    param = Object.assign(param, Status.videoViewRemoteSize);
    const tmp = obj || param
    this.webrtc
      .setVideoViewRemoteSize(tmp)
      .then(() => {
        console.log('设置对方画面大小--->:', tmp);
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  startLocalStream: function() {
    if (this.webrtc) {
      console.log('显示自己画面');
      this.webrtc.startLocalStream(Status.nodeLocal);
      this.setVideoViewSize();
    }
  },
  startLocalStreamMeeting: function() {
    if (this.webrtc) {
      console.log('显示自己画面');
      this.webrtc.startLocalStream(Status.nodeLocal);
      this.webrtc.setVideoViewSize(Status.videoViewSize);
    }
  },
  stopLocalStream: function() {
    if (this.webrtc) {
      console.log('停止自己画面显示');
      this.webrtc.stopLocalStream();
    }
  },
  startRemoteStream: function(obj) {
    const local = obj.uid === +RoomStatus.room.hostUid;
    const size = local ? Status.videoViewSize : Status.videoViewRemoteSize;
    var param = {
      account: obj.account,
      uid: obj.uid,
      node: local ? Status.nodeLocal : Status.nodeRemote
    };
    if (this.webrtc) {
      this.webrtc
        .startRemoteStream(param)
        .then(function() {
          console.log('显示对方画面--->:', param);
          this.setVideoViewRemoteSize(Object.assign(obj, size));
        })
        .catch(function(err) {
          console.log('开启远端画面失败', err);
        });
    }
  },
  stopRemoteStream: function() {
    var param = {};
    if (Status.targetAccount) {
      param.account = Status.targetAccount;
    }
    if (Status.targetUid) {
      param.uid = Status.targetUid;
    }
    if (this.webrtc) {
      this.webrtc
        .stopRemoteStream(param)
        .then(function() {
          console.log('停止对方画面显示--->:', param);
        })
        .catch(function(err) {
          console.log(err);
        });
    }
  },
  suspendLocalStream: function() {
    this.webrtc
      .suspendLocalStream()
      .then(function() {
        console.log('暂停本地画面显示');
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  resumeLocalStream: function() {
    this.webrtc
      .resumeLocalStream()
      .then(function() {
        console.log('恢复本地画面显示');
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  suspendRemoteStream: function() {
    var param = {};
    if (Status.targetAccount) {
      param.account = Status.targetAccount;
    }
    if (Status.targetUid) {
      param.uid = Status.targetUid;
    }
    this.webrtc
      .suspendRemoteStream(param)
      .then(function() {
        console.log('暂停对方画面显示--->:', param);
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  resumeRemoteStream: function() {
    var param = {};
    if (Status.targetAccount) {
      param.account = Status.targetAccount;
    }
    if (Status.targetUid) {
      param.uid = Status.targetUid;
    }
    this.webrtc
      .resumeRemoteStream(param)
      .then(function() {
        console.log('恢复对方画面显示--->:', param);
      })
      .catch(function(err) {
        console.log(err);
      });
  },
  setSessionVideoQuality: function() {
    this.webrtc &&
      this.webrtc.setSessionVideoQuality(Status.sessionConfig.videoQuality);
  },
  setFrameRate: function() {
    RtcConfig.setStatus({
      ['sessionConfig.videoFrameRate']: WebRTC.CHAT_VIDEO_FRAME_RATE_15
    });
    this.setSessionVideoFrameRate();
  },
  setSessionVideoFrameRate: function() {
    this.webrtc &&
      this.webrtc.setSessionVideoFrameRate(Status.sessionConfig.videoFrameRate);
  },
  setCaptureVolume: function() {
    this.webrtc && this.webrtc.setCaptureVolume(Status.captureVolume);
  },
  setPlayVolume: function() {
    var param = {
      volume: Status.playVolume
    };
    if (Status.targetAccount) {
      param.account = Status.targetAccount;
    }
    if (Status.targetUid) {
      param.uid = Status.targetUid;
    }
    this.webrtc &&
      this.webrtc
        .setPlayVolume(param)
        .then(function() {
          console.log('设置对方音量--->:', param);
        })
        .catch(function(err) {
          console.log(err);
        });
  },
  netDetect: function() {
    this.webrtc &&
      this.webrtc.netDetect().then(
        function(obj) {
          console.log('netDetect success', obj);
        },
        function(err) {
          console.log('netDetect error', err);
        }
      );
  },
  // NRTC专有,切换己方音视频模式
  switchwebrtcMode: function(type) {
    this.webrtc.switchwebrtcMode(type);
  }
};

// rtc = Object.assign(rtc, event);
// 注意：上面这种写法，Object.assign并不会copy原型上的方法!
rtc = Object.assign(event, rtc);

// window.rtc = rtc;

export default rtc;
