const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
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
    'react-use-gesture': 'react-use-gesture'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  devtool: 'cheap-source-map',
  optimization: {
    minimize: false
  },
  plugins: [new MiniCssExtractPlugin(), new CleanWebpackPlugin()]
};
