const path = require("path")
const webpack = require('webpack')
const BundleTracker = require('webpack-bundle-tracker')
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  context: __dirname,
  entry: './src/index',
  output: {
    path: path.resolve('./assets/dist/'),
    filename: "[name]-[hash].js",
  },
  plugins: [
    new BundleTracker({
      path: path.resolve('./assets/'),
      filename: 'webpack-stats.json'
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
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      cache: true,
      parallel: true
    })],
    moduleIds: 'hashed',
    runtimeChunk:'single',
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
    extensions: ['.js', '.jsx']
  }
}
