import { expect } from 'chai';
import path from 'path';

import { runTestServer } from './testServer';
import { runDriver } from './webdriver';
import { runUI, uiHelperSetup } from './uiSetup';

// extra timeout allowance on CI
const testTimeoutMs = process.env.CI ? 20000 : 10000;

describe('importer with input not terminated by EOL character at end of file', () => {
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
            dataHandler: (rows, info) => {
              const rawWin = window as any; // eslint-disable-line @typescript-eslint/no-explicit-any
              rawWin.TEST_DATA_HANDLER_ROWS = (
                rawWin.TEST_DATA_HANDLER_ROWS || []
              ).concat(rows);
              rawWin.TEST_DATA_HANDLER_INFO = info;
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
      await uploadFile(path.resolve(__dirname, './fixtures/noeof.csv'));
    });

    it('shows correctly parsed preview table', async () => {
      expect(await getDisplayedPreviewData()).to.deep.equal([
        ['ColA', 'ColB', 'ColC', 'ColD'],
        ['AAAA', 'BBBB', 'CCCC', 'DDDD']
      ]);
    });

    describe('after accepting and assigning fields', () => {
      beforeEach(async () => {
        await advanceToFieldStepAndFinish();
      });

      it('produces parsed data with correct fields', async () => {
        // await getDriver().sleep(10000);

        const parsedData = await getDriver().executeScript(
          'return window.TEST_DATA_HANDLER_ROWS'
        );
        const chunkInfo = await getDriver().executeScript(
          'return window.TEST_DATA_HANDLER_INFO'
        );

        expect(parsedData).to.deep.equal([
          { fieldA: 'AAAA' },
          { fieldA: 'EEEE' }
        ]);

        // chunk start may be 1 because the parser "flushes" the last line separately?
        expect(chunkInfo).to.deep.equal({ startIndex: 1 });
      });
    });
  });
}).timeout(testTimeoutMs);
