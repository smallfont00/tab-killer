const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const PACKAGE = require('./package.json');

module.exports = {
  entry: {
    background: './src/background/index.js',
    popup: './src/popup/index.jsx',
    options: './src/options/index.js'
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devServer: {
    contentBase: './dist'
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: path.resolve(__dirname, 'dist'),
          transform: (content, path) => Buffer.from(
            JSON.stringify({
              description: PACKAGE.description,
              version: PACKAGE.version,
              ...JSON.parse(content.toString())
            })
          )
        }
      ]
    }),
    new HtmlWebpackPlugin({
      title: 'popup page',
      chunks: ['popup'],
      filename: 'popup.html',
      template: './src/popup/index.html'
    }),
    new HtmlWebpackPlugin({
      title: 'options page',
      chunks: ['options'],
      filename: 'options.html',
      template: './src/options/index.html'
    })
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              // ["@babel/preset-env", { targets: { chrome: "80" }, corejs: "3.8", useBuiltIns: "usage" }],
              "@babel/preset-react"
            ]
          }
        }
      },
      {
        test: /\.(css|sass|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  }
}