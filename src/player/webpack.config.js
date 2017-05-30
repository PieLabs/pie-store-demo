const path = require('path');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  devtool: 'eval-source-map',
  context: path.join(__dirname),
  entry: {
    player: './src/player.js',
    partake: './src/partake.js'
  },
  output: {
    publicPath: '/player',
    path: path.join(__dirname, 'public'),
    filename: '[name].js',
    chunkFilename: '[chunkhash].[id].js'
  },
  module: {
    loaders: [
      { test: /\.css$/, use: ['raw-loader'] },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  resolveLoader: {
    modules: [
      path.resolve('../../node_modules'),
      'node_modules'
    ]
  },
  plugins: [
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
};
