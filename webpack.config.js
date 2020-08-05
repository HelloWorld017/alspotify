const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');


const nodeEnv = (process.env.NODE_ENV || 'development').trim();

module.exports = {
	entry: {
		alspotify: path.resolve(__dirname, 'app', 'index.js')
	},

	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js'
	},

	mode: nodeEnv,
	target: 'node',
	node: {
		__dirname: false
	},

	module: {
		rules: [
			{
				test: /\.node$/,
				loader: 'node-loader',
				options: {
					name: '[name].[ext]'
				}
			}
		]
	},

	plugins: [
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': `"${nodeEnv}"`
		}),

		new CopyWebpackPlugin({
			patterns: [
				{ from: 'node_modules/displays/build/Release/displays.node', to: 'displays.node' }
			]
		}),

		new webpack.NormalModuleReplacementPlugin(
			/^bindings$/,
			`${__dirname}/app/utils/Bindings`
		)
	],

	optimization: {
		minimize: false
	}
};
