const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => ({
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                noEmit: false
              }
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  devtool: 'eval-cheap-module-source-map',
  plugins: [
    // similar env file logic to create-react-app
    // (using webpack mode if no env is set)
    new Dotenv({
      systemvars: true,
      path: `.env.${process.env.NODE_ENV || argv.mode || 'production'}`,
      defaults: '.env'
    }),

    new MiniCssExtractPlugin(),

    new CleanWebpackPlugin()
  ]
});
