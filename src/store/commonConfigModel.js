/*
 * @Author: lduoduo 
 * @Date: 2018-01-19 16:49:25 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-19 16:54:40
 * 通用状态管理
 */

import { observable, computed, action } from 'mobx';
import { Config } from 'util';

// 注：data文件夹存放了一些敏感信息，不会公开出来，开发者需要自己设置这些值
import myConfig from 'data';

import defaultConfig from './config';

export default class CommonConfig {
  // 和房间聊天室相关配置
  @observable state = Object.assign({}, defaultConfig.commonInfo);

  @computed
  get rerefshEnv() {
    console.log(state);
    return;
  }

  @action
  setStatus(obj = {}) {
    console.log('store --> Common -> setStatus', obj);
    this.state = Object.assign(this.state, obj);
  }

  @action
  setInited(inited) {
    console.log('store --> Common -> setInited', !!inited);
    this.state.inited = !!inited;
  }
}
