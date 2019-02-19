'use strict';

if (process.platform === 'win32') module.exports = require('./win32');else module.exports = require('./posix');
//# sourceMappingURL=index.js.map