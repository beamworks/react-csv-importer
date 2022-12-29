import { expect } from 'chai';
import path from 'path';

import { runTestServer } from './testServer';
import { runDriver } from './webdriver';
import { runUI, uiHelperSetup } from './uiSetup';

type RawWindow = Record<string, unknown>;

// extra timeout allowance on CI
const testTimeoutMs = process.env.CI ? 20000 : 10000;

describe('importer with custom encoding setting', () => {
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
            encoding: 'windows-1250', // encoding incompatible with UTF-8
            delimiter: ',',
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
      await uploadFile(
        path.resolve(__dirname, './fixtures/encodingWindows1250.csv')
      );
    });

    it('shows correctly parsed preview table', async () => {
      expect(await getDisplayedPreviewData()).to.deep.equal([
        ['value1', 'value2'],
        ['Montréal', 'Köppen']
      ]);
    });

    describe('after accepting and assigning fields', () => {
      beforeEach(async () => {
        await advanceToFieldStepAndFinish();
      });

      it('produces parsed data with correct fields', async () => {
        const parsedData = await getDriver().executeScript(
          'return window.TEST_DATA_HANDLER_ROWS'
        );
        const chunkInfo = await getDriver().executeScript(
          'return window.TEST_DATA_HANDLER_INFO'
        );

        expect(parsedData).to.deep.equal([{ fieldA: 'Montréal' }]);
        expect(chunkInfo).to.deep.equal({ startIndex: 0 });
      });
    });
  });
}).timeout(testTimeoutMs);
