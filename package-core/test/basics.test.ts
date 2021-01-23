import { expect } from 'chai';
import ReactModule from 'react';
import ReactDOMModule from 'react-dom';

import { runTestServer } from './testServer';
import { runDriver } from './webdriver';

describe('importer basics', () => {
  const appUrl = runTestServer();
  const getDriver = runDriver();

  async function runScript(
    script: (r: typeof ReactModule, rd: typeof ReactDOMModule) => void
  ) {
    await getDriver().executeScript(`(${script.toString()})(React, ReactDOM)`);
  }

  it('adds 2 and 2', async () => {
    await getDriver().get(appUrl);

    await runScript((React, ReactDOM) => {
      ReactDOM.render(
        React.createElement('div', {}, ['Hello world']),
        document.getElementById('root')
      );
    });

    await getDriver().sleep(1000);

    expect(2 + 2).to.equal(4);
  });
});
