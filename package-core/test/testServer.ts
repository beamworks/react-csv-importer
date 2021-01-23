import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

const TEST_SERVER_PORT = 8090;

// @todo use pre-built dist folder instead (to properly test production artifacts)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const appWebpackConfig = require('../webpack.config');

export function runTestServer(): string {
  let testDevServer: WebpackDevServer | null = null; // internal handle

  const serverUrl = `http://localhost:${TEST_SERVER_PORT}`;

  before(async function () {
    // override config to allow direct in-browser usage with test code
    const webpackConfig = {
      ...appWebpackConfig,

      module: {
        ...appWebpackConfig.module,

        rules: [
          ...appWebpackConfig.module.rules,

          {
            test: require.resolve('react'),
            loader: 'expose-loader',
            options: {
              exposes: ['React']
            }
          },
          {
            test: require.resolve('react-dom'),
            loader: 'expose-loader',
            options: {
              exposes: ['ReactDOM']
            }
          }
        ]
      },

      output: {
        ...appWebpackConfig.output,
        publicPath: '/',

        // browser-friendly settings
        libraryTarget: 'global',
        library: 'ReactCSVImporter'
      },

      // ensure everything is included instead of generating require() statements
      externals: {},

      mode: 'production',
      watch: false
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const compiler = webpack(webpackConfig as any);

    const devServer = new WebpackDevServer(compiler, {
      contentBase: path.resolve(__dirname, './public'), // static test helper content
      hot: false,
      liveReload: false,
      noInfo: true,
      stats: 'errors-only'
    });

    // store reference for later cleanup
    testDevServer = devServer;

    const serverListenPromise = new Promise((resolve, reject) => {
      devServer.listen(TEST_SERVER_PORT, 'localhost', function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    const serverCompilationPromise = new Promise((resolve) => {
      compiler.hooks.done.tap('_', () => {
        resolve();
      });
    });

    await Promise.all([serverListenPromise, serverCompilationPromise]);
  });

  after(async function () {
    const devServer = testDevServer;
    testDevServer = null;

    if (!devServer) {
      throw new Error('dev server not initialized');
    }

    // wait for server to fully close
    await new Promise((resolve) => {
      devServer.close(() => {
        resolve();
      });
    });
  });

  return serverUrl;
}
