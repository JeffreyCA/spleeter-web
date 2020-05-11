const path = require("path")
const webpack = require('webpack')
const BundleTracker = require('webpack-bundle-tracker')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  mode: 'development',
  context: __dirname,
  devtool: 'eval',
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
    new CleanWebpackPlugin(),
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
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    moduleIds: 'hashed',
    runtimeChunk:'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      },
    }
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
}
