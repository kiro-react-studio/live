import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import alias from 'rollup-plugin-alias';

import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

const path = require('path');

// 环境变量
const ENV_DEV = 'DEV';
const ENV_PRD = 'PRD';

const env = process.env.NODE_ENV || ENV_DEV;

export default {
  input: './sdk/index.js',
  output: {
    file: './lib/ROOM.js',
    format: 'iife',
    // 包名
    name: 'ROOM'
  },
  cache: env === ENV_DEV,
  sourcemap: env === ENV_DEV,
  plugins: [
    // 注意！现在用别名路径还存在问题！！
    // 问题链接 https://github.com/rollup/rollup-plugin-alias/issues/37
    alias({
      resolve: ['.jsx', '.js'],
      util: path.join(__dirname, './src/util')
    }),
    resolve({
      jsnext: true, // 该属性是指定将Node包转换为ES2015模块
      // main 和 browser 属性将使插件决定将那些文件应用到bundle中
      main: true, // Default: true
      browser: true // Default: false
    }),
    commonjs(),
    // https://github.com/rollup/rollup-plugin-babel/issues/35
    babel({
      babelrc: false,
      //   presets: ['es2015-rollup'],
      exclude: 'node_modules/**' // 只编译我们的源代码
    }),
    process.env.NODE_ENV === ENV_PRD && uglify({}, minify)
  ]
};
