const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

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
			},

			{
				test: /\.(png|jpe?g|gif|woff2?|otf|ttf|eot)(\?|#.*)?$/,
				loader: 'file-loader',
				options: {
					name: 'assets/[name]-[hash:8].[ext]',
					publicPath: './dist',
					esModule: false
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
				{ from: 'node_modules/robotjs/build/Release/robotjs.node', to: 'robotjs.node' }
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

if(nodeEnv === 'production') {
	module.exports.optimization = {
		minimizer: [
			new TerserPlugin({
				parallel: true,
				extractComments: 'all',
				terserOptions: {
					compress: {
						reduce_vars: false
					}
				}
			})
		]
	}
}
