/*
 * @Author: lduoduo 
 * @Date: 2018-01-07 20:11:16 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-07 23:38:23
 * 
 * 日志美化库
 */

const colorMap = {
  info: 'blue',
  log: '#3d6dad',
  warn: 'orange',
  error: 'red'
};
export default {
  init() {
    this.loggerInfo = console.info;
    this.loggerWarn = console.warn;
    this.loggerError = console.error;
    this.loggerLog = console.log;

    this.reset();
  },
  reset() {
    var that = this;
    window.console.info = function() {
      that.log(['info', ...arguments]);
    };
    window.console.log = function() {
      that.log(['log', ...arguments]);
    };
    window.console.warn = function() {
      that.log(['warn', ...arguments]);
    };
    window.console.error = function() {
      that.log(['error', ...arguments]);
    };
  },
  log() {
    const params = arguments[0];
    if (params.length === 1) return;
    const type = params[0];
    const style = `color:${colorMap[type]};font-size:15px`;
    params.shift();
    params[0] = `%c${params[0]}`;
    params.splice(1, 0, style);
    // call(参数一个个传递) & apply(参数数组传递)
    this.loggerLog.apply(console, params);
  }
};
