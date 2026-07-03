// production config
// Babel decides the JSX runtime (jsx vs jsxDEV) from BABEL_ENV/NODE_ENV,
// which webpack's `mode` does not set for the build process itself.
process.env.BABEL_ENV = 'production'
process.env.NODE_ENV = 'production'

const { resolve } = require('path')

const { merge } = require('webpack-merge')

const commonConfig = require('./common')

module.exports = merge(commonConfig, {
  mode: 'production',
  output: {
    filename: 'js/bundle.[contenthash].min.js',
    path: resolve(__dirname, '../../dist'),
    publicPath: '/gpx-elevation-profile/',
  },
  devtool: 'source-map',
})
