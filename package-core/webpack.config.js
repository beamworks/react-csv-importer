const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => ({
  entry: { index: './src/index.ts' },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.base.json',
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
  externals: {
    papaparse: 'papaparse',
    react: 'react',
    'react-dom': 'react-dom',
    'react-dropzone': 'react-dropzone',
    'react-use-gesture': 'react-use-gesture',
    'readable-web-to-node-stream': 'readable-web-to-node-stream'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  devtool: 'cheap-source-map',
  optimization: {
    minimize: false
  },
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
