/*
 * @Author: lduoduo 
 * @Date: 2018-01-19 23:05:03 
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-19 23:11:40
 * 本地存储工具方法
 */

export default {
  get(name) {
    return localStorage.getItem(name);
  },
  set(name, value) {
    if (!name) return;
    localStorage.setItem(name, value);
  },
  remove(name) {
    localStorage.removeItem(name);
  }
};
