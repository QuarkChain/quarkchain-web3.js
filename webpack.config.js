const path = require('path');
const webpack = require('webpack');

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
        loader: 'babel-loader',
        query: {
          presets: ['env', 'stage-0'],
          plugins: [['add-module-exports']],
        },
      },
    ],
  },
  plugins: [new webpack.IgnorePlugin(/web3/)],
};
