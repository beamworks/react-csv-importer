import { By, until, ThenableWebDriver } from 'selenium-webdriver';
import ReactModule from 'react';
import ReactDOMModule from 'react-dom';

import {
  ImporterProps,
  ImporterFieldProps
} from '../src/components/ImporterProps';

export type ScriptBody = (
  r: typeof ReactModule,
  rd: typeof ReactDOMModule,
  im: (
    props: ImporterProps<Record<string, unknown>>
  ) => ReactModule.ReactElement,
  imf: (props: ImporterFieldProps) => ReactModule.ReactElement
) => void;

export function runUI(
  getDriver: () => ThenableWebDriver
): (script: ScriptBody) => Promise<void> {
  async function runScript(script: ScriptBody) {
    await getDriver().executeScript(
      `(${script.toString()})(React, ReactDOM, ReactCSVImporter.Importer, ReactCSVImporter.ImporterField)`
    );
  }

  // always clean up
  afterEach(async () => {
    await runScript((React, ReactDOM) => {
      ReactDOM.unmountComponentAtNode(
        document.getElementById('root') || document.body
      );
    });
  });

  return async function initUI(script: ScriptBody) {
    await runScript(script);

    await getDriver().wait(
      until.elementLocated(By.xpath('//span[contains(., "Drag-and-drop")]')),
      300 // a little extra time
    );
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function uiHelperSetup(getDriver: () => ThenableWebDriver) {
  return {
    async uploadFile(filePath: string) {
      const fileInput = await getDriver().findElement(By.xpath('//input'));
      await fileInput.sendKeys(filePath);

      await getDriver().wait(
        until.elementLocated(By.xpath('//*[contains(., "Raw File Contents")]')),
        300 // extra time
      );
    },

    async getDisplayedPreviewData() {
      const tablePreview = await getDriver().findElement(By.xpath('//table'));

      // header row
      const tableCols = await tablePreview.findElements(
        By.xpath('thead/tr/th')
      );
      const tableColStrings = await tableCols.reduce(
        async (acc, col) => [...(await acc), await col.getText()],
        Promise.resolve([] as string[])
      );

      // first data row
      const firstDataCells = await tablePreview.findElements(
        By.xpath('tbody/tr[1]/td')
      );
      const firstDataCellStrings = await firstDataCells.reduce(
        async (acc, col) => [...(await acc), await col.getText()],
        Promise.resolve([] as string[])
      );

      return [tableColStrings, firstDataCellStrings];
    },

    async advanceToFieldStepAndFinish() {
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
    }
  };
}
