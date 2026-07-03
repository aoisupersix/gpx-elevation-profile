// shared config (dev and prod)
const { resolve } = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')

/** @type import("webpack").Configuration */
module.exports = {
  entry: './index.tsx',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  context: resolve(__dirname, '../../src'),
  module: {
    rules: [
      {
        test: [/\.jsx?$/, /\.tsx?$/],
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(scss|sass)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'img/[contenthash][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html.ejs',
      favicon: 'assets/images/favicon.ico',
    }),
  ],
}
