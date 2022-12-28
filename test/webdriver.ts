import * as path from 'path';
import * as child_process from 'child_process';
import { Builder, ThenableWebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

async function getGlobalChromedriverPath() {
  const yarnGlobalPath = await new Promise<string>((resolve, reject) => {
    child_process.exec('yarn global dir', { timeout: 8000 }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.trim());
      }
    });
  });

  return path.resolve(
    yarnGlobalPath,
    './node_modules/chromedriver/lib/chromedriver',
    process.platform === 'win32' ? './chromedriver.exe' : './chromedriver'
  );
}

export function runDriver(): () => ThenableWebDriver {
  let webdriver: ThenableWebDriver | null = null;

  // same webdriver instance serves all the tests in the suite
  before(async function () {
    const chromedriverPath = await getGlobalChromedriverPath();

    const service = new chrome.ServiceBuilder(chromedriverPath).build();
    chrome.setDefaultService(service);

    webdriver = new Builder()
      .forBrowser('chrome')
      .setChromeOptions(
        process.env.CI ? new chrome.Options().headless() : new chrome.Options()
      )
      .build();
  });

  after(async function () {
    if (!webdriver) {
      throw new Error(
        'cannot clean up webdriver because it was not initialized'
      );
    }

    await webdriver.quit();

    // complete cleanup
    webdriver = null;
  });

  // expose singleton getter
  return () => {
    if (!webdriver) {
      throw new Error('webdriver not initialized');
    }

    return webdriver;
  };
}
