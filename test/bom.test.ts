import { expect } from 'chai';
import path from 'path';

import { runTestServer } from './testServer';
import { runDriver } from './webdriver';
import { runUI, uiHelperSetup } from './uiSetup';
import { ImportInfo } from '../src/components/ImporterProps';

type RawWindow = Record<string, unknown>;

// extra timeout allowance on CI
const testTimeoutMs = process.env.CI ? 20000 : 10000;

describe('importer with input containing BOM character', () => {
  const appUrl = runTestServer();
  const getDriver = runDriver();
  const initUI = runUI(getDriver);
  const {
    uploadFile,
    getDisplayedPreviewData,
    advanceToFieldStepAndFinish
  } = uiHelperSetup(getDriver);

  beforeEach(async () => {
    await getDriver().get(appUrl);

    await initUI((React, ReactDOM, ReactCSVImporter, ReactCSVImporterField) => {
      ReactDOM.render(
        React.createElement(
          ReactCSVImporter,
          {
            onStart: (info) => {
              ((window as unknown) as RawWindow).TEST_ON_START_INFO = info;
            },
            dataHandler: (rows, info) => {
              ((window as unknown) as RawWindow).TEST_DATA_HANDLER_ROWS = rows;
              ((window as unknown) as RawWindow).TEST_DATA_HANDLER_INFO = info;
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
      await uploadFile(path.resolve(__dirname, './fixtures/bom.csv'));
    });

    it('shows correctly parsed preview table', async () => {
      expect(await getDisplayedPreviewData()).to.deep.equal([
        ['Date', 'Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume'],
        [
          '2019-09-16',
          '299.839996',
          '301.140015',
          '299.450012',
          '300.160004',
          '294.285339',
          '58191200'
        ]
      ]);
    });

    describe('after accepting and assigning fields', () => {
      beforeEach(async () => {
        await advanceToFieldStepAndFinish();
      });

      it('reports correct import info', async () => {
        const importInfo = await getDriver().executeScript(
          'return window.TEST_ON_START_INFO'
        );

        expect(importInfo).to.have.property('preview');

        const { preview } = importInfo as ImportInfo;
        expect(preview).to.have.property('columns');
        expect(preview.columns).to.be.an('array');

        expect(preview.columns.map((item) => item.header)).to.deep.equal([
          'Date', // should not have BOM prefix
          'Open',
          'High',
          'Low',
          'Close',
          'Adj Close',
          'Volume'
        ]);
      });

      it('produces parsed data with correct fields', async () => {
        const parsedData = await getDriver().executeScript(
          'return window.TEST_DATA_HANDLER_ROWS'
        );
        const chunkInfo = await getDriver().executeScript(
          'return window.TEST_DATA_HANDLER_INFO'
        );

        expect(parsedData).to.deep.equal([{ fieldA: '2019-09-16' }]);
        expect(chunkInfo).to.deep.equal({ startIndex: 0 });
      });
    });
  });
}).timeout(testTimeoutMs);
