const Module = require('module');

Module._extensions['.png'] = (module, filename) => {
	module.exports = filename;
}

require('./index');
