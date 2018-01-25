/** 异步请求api */

/**
 * 异步请求方法
 *
 * @param {any} option
 * @param {string} [option.type=get] 请求方式: GET / POST
 * @param {string} [option.dataType=json] 数据传递方式: json / 其他
 * @param {string} option.url 请求地址
 * @param {data} option.data 请求数据
 */
const getFormData = data =>
  Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(/Object/i.test(data[key]) ? JSON.stringify(data[key]) : data[key]))
    .join('&')

export default function (option) {
  if (!option.url || !option.data) {
    return Promise.reject('参数不完整，无法发起请求')
  }

  option.dataType = option.dataType || 'json'

  var xhr = new XMLHttpRequest()
  xhr.open(option.type || 'GET', option.url, true)
  xhr.responseType = `${option.dataType}`

//   xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8')
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
  

  return new Promise((resolve, reject) => {
    xhr.onload = function () {
      var data = xhr.response
      // data = JSON.parse(data)
      resolve(data)
    }
    xhr.onerror = function (e) {
      reject(e)
    }
    xhr.send(getFormData(option.data))
    // xhr.send(JSON.stringify(option.data))
  })
}
