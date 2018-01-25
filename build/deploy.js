/**
 * 打包静态资源到静态资源服务器
 */

const fs = require('fs-extra');

const path = require('path');
const projectName = require('../package.json').name;

var srcFolder = path.join(__dirname, `../output`);
var destFolder = path.join(
  __dirname,
  `../../web-static/static/${projectName}/`
);

fs.emptyDirSync(destFolder);

copy(srcFolder, destFolder);

function copy(srcFolder, destFolder, excludePath) {
  console.log('\nsrcFolder:', srcFolder);
  console.log('destFolder:', destFolder);

  const obj = {
    dereference: true
  };
  if (excludePath) {
    obj.filter = file => file !== excludePath;
  }

  fs.copy(srcFolder, destFolder, obj);
}
