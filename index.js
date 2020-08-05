const { register } = require('asar-node');
register();

(() => {
	const Module = require('module')
	const path = require('path')

	const resolvePaths = function resolvePaths (paths) {
		for (let i = 0; i < paths.length; i++) {
			if (path.basename(paths[i]) === 'node_modules') {
				paths.splice(i + 1, 0, 'dist', paths[i] + '.asar')
				i++
			}
		}
	};

	const oldResolveLookupPaths = Module._resolveLookupPaths
	Module._resolveLookupPaths = oldResolveLookupPaths.length === 2 ? function (request, parent) {
		const result = oldResolveLookupPaths.call(this, request, parent)
		if (!result) return result

		resolvePaths(result)

		return result
	} : function (request, parent, newReturn) {
		const result = oldResolveLookupPaths.call(this, request, parent, newReturn)

		const paths = newReturn ? result : result[1]
		resolvePaths(paths)

		return result
	}
})()

require('./dist/app.asar/index');
