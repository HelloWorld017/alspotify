const asar = require('asar');

asar.createPackageWithOptions(
	'node_modules',
	'dist/node_modules.asar',
	{
		globOptions: {
			ignore: [
				'node_modules/@nodegui/nodegui/config/**/*',
				'node_modules/@nodegui/nodegui/extras/**/*',
				'node_modules/@nodegui/nodegui/miniqt/**/*',
				'node_modules/@nodegui/nodegui/plugin/**/*',
				'node_modules/@nodegui/nodegui/scripts/**/*',
				'node_modules/@nodegui/nodegui/src/**/*'
			]
		},

		unpack: '**/*.node'
	}
);

// TODO copy node_modules\@nodegui\nodegui\build\Release\nodegui_core.node
