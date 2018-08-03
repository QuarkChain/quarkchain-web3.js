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
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [new webpack.IgnorePlugin(/web3/)],
};
