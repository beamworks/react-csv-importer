import { By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import path from 'path';
import ReactModule from 'react';
import ReactDOMModule from 'react-dom';
import { ImporterProps } from '../src/components/ImporterProps';

import { runTestServer } from './testServer';
import { runDriver } from './webdriver';

// extra timeout allowance on CI
const testTimeoutMs = process.env.CI ? 20000 : 10000;

describe('importer basics', () => {
  const appUrl = runTestServer();
  const getDriver = runDriver();

  async function runScript(
    script: (
      r: typeof ReactModule,
      rd: typeof ReactDOMModule,
      im: (
        props: ImporterProps<Record<string, unknown>>
      ) => ReactModule.ReactElement
    ) => void
  ) {
    await getDriver().executeScript(
      `(${script.toString()})(React, ReactDOM, ReactCSVImporter.Importer)`
    );
  }

  beforeEach(async () => {
    await getDriver().get(appUrl);

    await runScript((React, ReactDOM, ReactCSVImporter) => {
      ReactDOM.render(
        React.createElement(
          ReactCSVImporter,
          {
            processChunk: (rows) => {
              console.log('chunk', rows);
            }
          },
          []
        ),
        document.getElementById('root')
      );
    });

    await getDriver().wait(
      until.elementLocated(By.xpath('//span[contains(., "Drag-and-drop")]')),
      300 // a little extra time
    );
  });

  afterEach(async () => {
    await runScript((React, ReactDOM) => {
      ReactDOM.unmountComponentAtNode(
        document.getElementById('root') || document.body
      );
    });
  });

  it('shows file selector', async () => {
    const fileInput = await getDriver().findElement(By.xpath('//input'));
    expect(await fileInput.getAttribute('type')).to.equal('file');
  });

  it('accepts file', async () => {
    const filePath = path.resolve(__dirname, './fixtures/simple.csv');

    const fileInput = await getDriver().findElement(By.xpath('//input'));
    fileInput.sendKeys(filePath);

    await getDriver().wait(
      until.elementLocated(
        By.xpath('//span[contains(., "Raw File Contents")]')
      ),
      300 // extra time
    );
  });
}).timeout(testTimeoutMs);
