const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './index.js',
  output: {
    filename: 'quarkchain-web3.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'QuarkChain',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
      new webpack.IgnorePlugin(/xmlhttprequest/),
      new CopyWebpackPlugin([
        {
          from: 'lib/**',
          to: './'
        }
      ])
  ],
};
