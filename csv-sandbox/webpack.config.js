const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => ({
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/', // ensure absolute path is used in resource references
    filename: 'index.[contenthash].js'
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
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      {
        test: /\.(jpg|jpeg|gif|png|svg|eot|ttf|woff2|woff|truetype)$/,
        use: 'file-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'] // including .js for dev-server
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

    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html')
    })
  ],
  devServer: {
    historyApiFallback: true,
    disableHostCheck: true // for ngrok tunnel
  }
});
