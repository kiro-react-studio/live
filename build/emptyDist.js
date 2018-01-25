const fs = require('fs-extra')

fs.emptyDirSync('./.cache')
fs.emptyDirSync('./dist')
fs.emptyDirSync('./output')
