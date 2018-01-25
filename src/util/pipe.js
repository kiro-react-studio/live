/*
 * @Author: lduoduo
 * @Date: 2018-01-21 23:22:53
 * @Last Modified by: lduoduo
 * @Last Modified time: 2018-01-24 19:46:19
 * 管道方法，组合多个返回promise并且需要串联的方法
 * 调用方法很简单
 * 1. import { Pipes } from 'util';
 * 2. Pipes(f1,f2,f3) / Pipes([f1,f2,f3])
 * 注意！！！
 * 请自己绑好作用域!!
 */

const proxyP = {
  // 顺序执行promise的包装函数
  pipe() {
    const arr = [...arguments];
    return this._pipe(arr.length === 1 ? arr[0] : arr);
  },

  _pipe(arr = [], para) {
    const fn = arr.shift();
    const promise =
      para && para.constructor === Promise ? para : Promise.resolve(para);
    return promise.then(() => {
      if (arr.length === 0) {
        return this._pipeLast(fn, para);
      }

      return this._pipeLast(fn, para).then(data => {
        console.log('当前结果', data);
        return this._pipe(arr, data);
      });
    });
  },

  _pipeLast(fn, para) {
    // console.log('current pipe', fn, para);
    // 基本类型
    if (!fn || (fn.constructor !== Function && fn.constructor !== Promise))
      return Promise.resolve(fn);

    if (fn.constructor === Promise) {
      return fn;
    }

    if (fn.constructor === Function) {
      const result = fn(para);
      if (result.constructor === Promise) {
        return result;
      }

      return Promise.resolve(result);
    }

    return Promise.resolve(fn);
  }
};

const fn = {
  f1() {
    console.log('执行 f1');

    return Promise.resolve('dataF1');
  },
  f2(data) {
    console.log('执行 promise f2 param', data);

    return new Promise((resolve, reject) => {
      setTimeout(function() {
        const result = Math.random();
        result > 0.5
          ? resolve(`成功返回 f2 ${result}`)
          : reject(`失败返回 f2 ${result}`);
      }, 3000);
    });
  },
  f3(data) {
    console.log('执行 普通函数 f3 param', data);
    return {
      name: 'f3',
      result: data
    };
  },
  f4(data) {
    console.log('执行 普通函数 f4 param', data);
    return {
      name: 'f4',
      result: data
    };
  }
};

const test = {
  test1() {
    proxyP
      .pipe(fn.f1, fn.f2, fn.f3)
      .then(data => {
        console.log('promise done', data);
      })
      .catch(err => {
        console.log('promise fail', err);
      });
  },
  test2() {
    proxyP
      .pipe([fn.f1, fn.f2, fn.f3])
      .then(data => {
        console.log('promise done', data);
      })
      .catch(err => {
        console.log('promise fail', err);
      });
  }
};

export default function() {
  const arr = [...arguments];
  return proxyP._pipe(arr.length === 1 ? arr[0] : arr);
}
