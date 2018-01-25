/**
 * 静态资源路径重命名
 */
const path = require('path');
const fse = require('fs-extra');
const ip = require('./ip');

// 环境变量
const ENV_DEV = 'DEV';
const ENV_PRD = 'PRD';
const PORT = 10000;

const CURRENT = {
  ENV: process.env.NODE_ENV || ENV_DEV,
  PORT: process.env.PORT || PORT
};

const PRE = {
  DEV: `//${ip()}:${CURRENT.PORT}`,
  PRD: '//ldodo.cc/static/live'
};

const srcHtml = path.join(__dirname, '../output/index.html');

var data = fse.readFileSync(srcHtml, 'utf-8');
console.log('env', PRE[CURRENT.ENV]);

data = data.replace(/src="\/\/lib/g, 'src="' + PRE[CURRENT.ENV] + '/lib');
if (CURRENT.ENV === ENV_PRD) {
  data = data.replace(/\/output/g, '.');
}
// console.log('data', data);
fse.outputFileSync(srcHtml, data);

console.log('replace done');


// copy lib目录
fse.copy(path.join(__dirname, '../lib/'), path.join(__dirname, '../output/lib'));
