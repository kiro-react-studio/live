/*
 * @Author: lduoduo 
 * @Date: 2018-01-07 19:56:05 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-21 13:03:52
 * 
 * 加入房间的扩展脚本，主要融合room房间管理
 */

import { Room } from 'flow';
import { Ajax, Alert } from 'util';
// 引入状态管理模块
import { RoomConfig, RtcConfig } from 'store.action';
const RoomStatus = RoomConfig.data;

export default {
  init() {
    Room.init().catch(err => {
      Alert({ msg: error });
      console.error(err);
    });
  },
  create() {
    if (RoomStatus.calling) {
      return Promise.reject('当前已经在房间中了');
    }
    if (!RoomStatus.roomName) {
      return Promise.reject('请输入房间号');
    }
    return Room.create({ roomName: RoomStatus.roomName, uid: RoomStatus.uid });
  },
  join() {
    if(RoomStatus.calling){
      return Promise.reject('当前正在房间中，如果要加入别的房间，请退出再加入');
    }
    if (!RoomStatus.roomName) {
      return Promise.reject('请输入房间号');
    }
    return Room.join({ roomId: RoomStatus.roomName, uid: RoomStatus.uid }).then(data =>{
      const role = data.scene === 1 || data.hostUid === RoomStatus.uid ? 0 : 1
      RoomConfig.setCalling(true)
      RoomConfig.setRole(role)
      RtcConfig.setRole(role)
      return Promise.resolve(data)
    });
  }
};
