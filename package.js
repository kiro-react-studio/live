export default {
  name: 'duoduo-live',
  version: '1.0.0',
  description: '',
  main: 'index.js',
  scripts: {
    test: 'echo "Error: no test specified" && exit 1',
    start: 'parcel ./src/entry/index.html -p 9999',
    dev: 'parcel watch ./src/entry/index.html -p 9999'
  },
  author: 'lduoduo',
  license: 'ISC',
  dependencies: {
    classnames: '^2.2.5',
    history: '^4.7.2',
    mobx: '^3.4.1',
    'mobx-preact': '^1.1.0',
    preact: '^8.2.7',
    'preact-router': '^2.6.0'
  },
  devDependencies: {
    babel: '^6.23.0',
    'babel-core': '^6.26.0',
    'babel-plugin-module-resolver': '^3.0.0',
    'babel-plugin-transform-decorators-legacy': '^1.3.4',
    'babel-preset-env': '^1.6.1',
    'babel-preset-es2015': '^6.24.1',
    'babel-preset-react': '^6.24.1',
    'babel-preset-stage-1': '^6.24.1'
  }
};
