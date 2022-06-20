const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: './src/index',
  output: {
    path: path.resolve('./assets/dist/'),
    filename: '[name].js'
  },
  plugins: [
    new CopyWebpackPlugin({ 
      patterns: [ 
        { from: './src/favicon.ico' },
        { from: './src/favicon.svg' },
        { from: './node_modules/@ffmpeg/core/dist/*' },
      ]
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
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
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true
      })
    ],
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
  performance: {
    hints: false
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
};
