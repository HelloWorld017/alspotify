const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const path = require('path');


const nodeEnv = (process.env.NODE_ENV || 'development').trim();

module.exports = {
  resolve: {
    extensions: ['.ts', '.json', '.js', '.wasm'],
  },

  entry: {
    alspotify: path.resolve(__dirname, 'app', 'index.ts')
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
    noParse: /\/NativeRequire.js$/,
    rules: [
      {
        test: /\.node$/,
        loader: 'node-loader',
        options: {
          name: '[name].[ext]'
        }
      },

      {
        test: /\.ts$/,
        exclude: /node_module/,
        loader: 'ts-loader',
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

    new webpack.NormalModuleReplacementPlugin(
      /^bindings$/,
      `${__dirname}/app/utils/Bindings`
    )
  ],

  optimization: {
    minimize: false
  }
};

if (nodeEnv === 'production') {
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
