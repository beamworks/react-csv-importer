import { expect } from 'chai';

import { runTestServer } from './testServer';
import { runDriver } from './webdriver';

describe('importer basics', () => {
  const appUrl = runTestServer();
  const getDriver = runDriver();

  it('adds 2 and 2', () => {
    expect(2 + 2).to.equal(4);
  });
});
