/*
 * @Author: lduoduo 
 * @Date: 2018-01-07 19:56:05 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-21 13:23:50
 * 
 * room的扩展脚本，主要融合room房间管理
 */

import { Room } from 'flow';
import { Ajax, Alert } from 'util';
// 引入状态管理模块
import { RoomConfig, RtcConfig } from 'store.action';
const RoomStatus = RoomConfig.data;

export default {
  initRoom() {
    return Room.init().then(() => {
      console.log('going to join');
      return this.joinRoom();
    });
  },
  joinRoom() {
    console.log('fn: join');
    if (RoomStatus.calling) {
      return Promise.resolve();
    }
    if (!RoomStatus.roomName) {
      return Promise.reject('房间不存在');
    }
    return Room.join({ roomId: RoomStatus.roomName, uid: RoomStatus.uid }).then(
      data => {
        const role =
          data.scene === 1 || data.hostUid === RoomStatus.uid ? 0 : 1;
        RoomConfig.setCalling(true);
        RoomConfig.setRole(role);
        RtcConfig.setRole(role);
        return Promise.resolve();
      }
    );
  },
  leaveRoom() {
    Room.leave();
    console.log('leave room success');
    RoomConfig.setCalling(false);
  }
};
