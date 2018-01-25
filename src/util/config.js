/**
 * 默认配置项
 */

export default {
  // 环境配置
  env: ['DEV', 'PROD'],
  // 场景配置
  scene: [
    { value: 1, label: '会议' },
    { value: 2, label: '直播' }
  ],
  // 1: 观众, 2: 互动者, 0: 主播
  role: [
    { value: 0, label: '主播' },
    { value: 2, label: '连麦' },
    { value: 1, label: '观众' }
  ],
  url: {
    // wss: '192.168.31.210:10000'
    wss: 'ldodo.cc/live/server'
  }
};
