import { By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import ReactModule from 'react';
import ReactDOMModule from 'react-dom';
import { ImporterProps } from '../src/components/ImporterProps';

import { runTestServer } from './testServer';
import { runDriver } from './webdriver';

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

  it('shows file selector', async () => {
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
      until.elementLocated(
        By.xpath('//span[contains(., "Drag-and-drop CSV file here")]')
      ),
      300 // a little extra time
    );

    const fileInput = await getDriver().findElement(By.xpath('//input'));
    expect(await fileInput.getAttribute('type')).to.equal('file');

    await getDriver().sleep(1000); // @todo remove
  });
});
