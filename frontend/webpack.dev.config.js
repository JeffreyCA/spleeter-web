const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',
  context: __dirname,
  devtool: 'eval',
  entry: './src/index',
  output: {
    path: path.resolve('./assets/dist/'),
    filename: '[name]-[hash].js',
    publicPath: '/static/dist/',
  },
  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: './assets/webpack-stats.json'
    }),
    new CopyWebpackPlugin({ 
      patterns: [ 
        { from: './src/favicon.ico' },
        { from: './src/favicon.svg' },
        { from: './node_modules/@jeffreyca/ffmpeg.wasm-core/dist/*' },
      ]
    }),
    new CleanWebpackPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      },
      {
        test: /\.(ts|js)x?$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    moduleIds: 'hashed',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
};
