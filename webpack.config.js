const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './frontend/src/index.jsx',
    admin: './frontend/src/admin.jsx',
    user: './frontend/src/user.jsx'
  },
  output: {
    path: path.resolve(__dirname, 'static/js'),
    filename: '[name]-bundle.js',
    publicPath: '/static/js/',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  mode: 'development',
  devtool: 'source-map'
};