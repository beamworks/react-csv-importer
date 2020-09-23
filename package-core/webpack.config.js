const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => ({
  entry: './src/index.ts',
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
    'react-use-gesture': 'react-use-gesture'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  devtool: false, // leave code simple for cleaner downstream bundling
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
