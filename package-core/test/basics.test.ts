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

  describe('with file selected', () => {
    beforeEach(async () => {
      const filePath = path.resolve(__dirname, './fixtures/simple.csv');

      const fileInput = await getDriver().findElement(By.xpath('//input'));
      fileInput.sendKeys(filePath);

      await getDriver().wait(
        until.elementLocated(By.xpath('//*[contains(., "Raw File Contents")]')),
        300 // extra time
      );
    });

    it('shows file name under active focus for screen reader', async () => {
      const focusedHeading = await getDriver().switchTo().activeElement();
      expect(await focusedHeading.getText()).to.equal('simple.csv');
    });

    it('shows raw file contents', async () => {
      const rawPreview = await getDriver().findElement(By.xpath('//pre'));
      expect(await rawPreview.getText()).to.have.string('AAAA,BBBB,CCCC,DDDD');
    });

    it('shows a preview table', async () => {
      const tablePreview = await getDriver().findElement(By.xpath('//table'));

      // header row
      const tableCols = await tablePreview.findElements(
        By.xpath('thead/tr/th')
      );
      const tableColStrings = await tableCols.reduce(
        async (acc, col) => [...(await acc), await col.getText()],
        Promise.resolve([] as string[])
      );
      expect(tableColStrings).to.deep.equal(['ColA', 'ColB', 'ColC', 'ColD']);

      // first data row
      const firstDataCells = await tablePreview.findElements(
        By.xpath('tbody/tr[1]/td')
      );
      const firstDataCellStrings = await firstDataCells.reduce(
        async (acc, col) => [...(await acc), await col.getText()],
        Promise.resolve([] as string[])
      );
      expect(firstDataCellStrings).to.deep.equal([
        'AAAA',
        'BBBB',
        'CCCC',
        'DDDD'
      ]);
    });

    it('allows toggling header row', async () => {
      const headersCheckbox = await getDriver().findElement(
        By.xpath(
          '//label[contains(., "Data has headers")]/input[@type="checkbox"]'
        )
      );

      await headersCheckbox.click();

      // ensure there are no headers now
      const tablePreview = await getDriver().findElement(By.xpath('//table'));
      const tableCols = await tablePreview.findElements(
        By.xpath('thead/tr/th')
      );
      expect(tableCols.length).to.equal(0);

      // first data row should now show the header strings
      const firstDataCells = await tablePreview.findElements(
        By.xpath('tbody/tr[1]/td')
      );
      const firstDataCellStrings = await firstDataCells.reduce(
        async (acc, col) => [...(await acc), await col.getText()],
        Promise.resolve([] as string[])
      );
      expect(firstDataCellStrings).to.deep.equal([
        'ColA',
        'ColB',
        'ColC',
        'ColD'
      ]);
    });
  });
}).timeout(testTimeoutMs);
