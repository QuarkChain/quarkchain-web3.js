const path = require('path');

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
          presets: ['es2015', 'stage-0'],
          plugins: [
            ['add-module-exports'],
          ],
        },
      },
    ],
  },
};
