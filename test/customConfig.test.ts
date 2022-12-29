import { By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import path from 'path';

import { runTestServer } from './testServer';
import { runDriver } from './webdriver';
import { runUI } from './uiSetup';

// extra timeout allowance on CI
const testTimeoutMs = process.env.CI ? 20000 : 10000;

describe('importer with custom Papa Parse config', () => {
  const appUrl = runTestServer();
  const getDriver = runDriver();
  const initUI = runUI(getDriver);

  beforeEach(async () => {
    await getDriver().get(appUrl);

    await initUI((React, ReactDOM, ReactCSVImporter, ReactCSVImporterField) => {
      ReactDOM.render(
        React.createElement(
          ReactCSVImporter,
          {
            delimiter: '!', // not a normal guessable delimiter for Papa Parse
            dataHandler: (rows, info) => {
              ((window as unknown) as Record<
                string,
                unknown
              >).TEST_DATA_HANDLER_ROWS = rows;
              ((window as unknown) as Record<
                string,
                unknown
              >).TEST_DATA_HANDLER_INFO = info;
            }
          },
          [
            React.createElement(ReactCSVImporterField, {
              name: 'fieldA',
              label: 'Field A'
            }),
            React.createElement(ReactCSVImporterField, {
              name: 'fieldB',
              label: 'Field B',
              optional: true
            })
          ]
        ),
        document.getElementById('root')
      );
    });
  });

  describe('at preview stage', () => {
    beforeEach(async () => {
      const filePath = path.resolve(
        __dirname,
        './fixtures/customDelimited.txt'
      );

      const fileInput = await getDriver().findElement(By.xpath('//input'));
      await fileInput.sendKeys(filePath);

      await getDriver().wait(
        until.elementLocated(By.xpath('//*[contains(., "Raw File Contents")]')),
        300 // extra time
      );
    });

    it('shows correctly parsed preview table', async () => {
      const tablePreview = await getDriver().findElement(By.xpath('//table'));

      // header row
      const tableCols = await tablePreview.findElements(
        By.xpath('thead/tr/th')
      );
      const tableColStrings = await tableCols.reduce(
        async (acc, col) => [...(await acc), await col.getText()],
        Promise.resolve([] as string[])
      );
      expect(tableColStrings).to.deep.equal(['val1', 'val2']);

      // first data row
      const firstDataCells = await tablePreview.findElements(
        By.xpath('tbody/tr[1]/td')
      );
      const firstDataCellStrings = await firstDataCells.reduce(
        async (acc, col) => [...(await acc), await col.getText()],
        Promise.resolve([] as string[])
      );
      expect(firstDataCellStrings).to.deep.equal(['val3', 'val4']);
    });

    describe('after accepting and assigning fields', () => {
      beforeEach(async () => {
        const previewNextButton = await getDriver().findElement(
          By.xpath('//button[text() = "Choose columns"]')
        );

        await previewNextButton.click();

        await getDriver().wait(
          until.elementLocated(By.xpath('//*[contains(., "Select Columns")]')),
          300 // extra time
        );

        // start the keyboard-based selection mode
        const focusedHeading = await getDriver().switchTo().activeElement();
        await focusedHeading.sendKeys('\t'); // tab to next element

        const selectButton = await getDriver().findElement(
          By.xpath('//button[@aria-label = "Select column for assignment"][1]')
        );
        await selectButton.sendKeys('\n'); // cannot use click

        await getDriver().wait(
          until.elementLocated(
            By.xpath('//*[contains(., "Assigning column A")]')
          ),
          200
        );

        const assignButton = await getDriver().findElement(
          By.xpath('//button[@aria-label = "Assign column A"]')
        );
        await assignButton.click();

        const fieldsNextButton = await getDriver().findElement(
          By.xpath('//button[text() = "Import"]')
        );

        await fieldsNextButton.click();

        await getDriver().wait(
          until.elementLocated(
            By.xpath(
              '//button[@aria-label = "Go to previous step"]/../*[contains(., "Import")]'
            )
          ),
          200
        );

        await getDriver().wait(
          until.elementLocated(By.xpath('//*[contains(., "Complete")]')),
          200
        );
      });

      it('produces parsed data with correct fields', async () => {
        const parsedData = await getDriver().executeScript(
          'return window.TEST_DATA_HANDLER_ROWS'
        );
        const chunkInfo = await getDriver().executeScript(
          'return window.TEST_DATA_HANDLER_INFO'
        );

        expect(parsedData).to.deep.equal([{ fieldA: 'val3' }]);
        expect(chunkInfo).to.deep.equal({ startIndex: 0 });
      });
    });
  });
}).timeout(testTimeoutMs);
