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
