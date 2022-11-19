import { By, until } from 'selenium-webdriver';
import { expect } from 'chai';
import path from 'path';

import { runTestServer } from './testServer';
import { runDriver } from './webdriver';
import { runUI } from './uiSetup';

// extra timeout allowance on CI
const testTimeoutMs = process.env.CI ? 20000 : 10000;

describe('importer basics', () => {
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
            processChunk: (rows, info) => {
              ((window as unknown) as Record<
                string,
                unknown
              >).TEST_PROCESS_CHUNK_ROWS = rows;
              ((window as unknown) as Record<
                string,
                unknown
              >).TEST_PROCESS_CHUNK_INFO = info;

              return new Promise((resolve) => {
                ((window as unknown) as Record<
                  string,
                  unknown
                >).TEST_PROCESS_CHUNK_RESOLVE = resolve;
              });
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

  it('shows file selector', async () => {
    const fileInput = await getDriver().findElement(By.xpath('//input'));
    expect(await fileInput.getAttribute('type')).to.equal('file');
  });

  it('with unsupported file selected', async () => {
    const filePath = path.resolve(__dirname, './fixtures/img.png');

    const fileInput = await getDriver().findElement(By.xpath('//input'));
    await fileInput.sendKeys(filePath);

    await getDriver().wait(
      until.elementLocated(By.xpath('//*[contains(., "File format not supported")]')),
      300 // extra time
    );

    const errorBlock = await getDriver().findElement(By.xpath('//*[contains(., "File format not supported")]'))
    expect(await errorBlock.getText()).to.include("File format not supported")
  })

  describe('with file selected', () => {
    beforeEach(async () => {
      const filePath = path.resolve(__dirname, './fixtures/simple.csv');

      const fileInput = await getDriver().findElement(By.xpath('//input'));
      await fileInput.sendKeys(filePath);

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

    describe('with preview accepted', () => {
      beforeEach(async () => {
        const nextButton = await getDriver().findElement(
          By.xpath('//button[text() = "Choose columns"]')
        );

        await nextButton.click();

        await getDriver().wait(
          until.elementLocated(By.xpath('//*[contains(., "Select Columns")]')),
          300 // extra time
        );
      });

      it('shows selection prompt under active focus for screen reader', async () => {
        const focusedHeading = await getDriver().switchTo().activeElement();
        expect(await focusedHeading.getText()).to.equal('Select Columns');
      });

      it('shows target fields', async () => {
        const targetFields = await getDriver().findElements(
          By.xpath('//section[@aria-label = "Target fields"]/section')
        );

        expect(targetFields.length).to.equal(2);
        expect(await targetFields[0].getAttribute('aria-label')).to.equal(
          'Field A (required)'
        );
        expect(await targetFields[1].getAttribute('aria-label')).to.equal(
          'Field B (optional)'
        );
      });

      it('does not allow to proceed without assignment', async () => {
        const nextButton = await getDriver().findElement(
          By.xpath('//button[text() = "Import"]')
        );

        await nextButton.click();

        await getDriver().wait(
          until.elementLocated(
            By.xpath('//*[contains(., "Please assign all required fields")]')
          ),
          300 // extra time
        );
      });

      it('offers keyboard-only select start buttons', async () => {
        const selectButtons = await getDriver().findElements(
          By.xpath('//button[@aria-label = "Select column for assignment"]')
        );

        expect(selectButtons.length).to.equal(4);
      });

      describe('with assigned field', () => {
        beforeEach(async () => {
          // start the keyboard-based selection mode
          const focusedHeading = await getDriver().switchTo().activeElement();
          await focusedHeading.sendKeys('\t'); // tab to next element

          const selectButton = await getDriver().findElement(
            By.xpath(
              '//button[@aria-label = "Select column for assignment"][1]'
            )
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
        });

        describe('with confirmation to start processing', () => {
          beforeEach(async () => {
            const nextButton = await getDriver().findElement(
              By.xpath('//button[text() = "Import"]')
            );

            await nextButton.click();

            await getDriver().wait(
              until.elementLocated(
                By.xpath(
                  '//button[@aria-label = "Go to previous step"]/../*[contains(., "Import")]'
                )
              ),
              200
            );
          });

          it('sets focus on next heading', async () => {
            const focusedHeading = await getDriver().switchTo().activeElement();
            expect(await focusedHeading.getText()).to.equal('Import');
          });

          it('does not finish until processChunk returns', async () => {
            await getDriver().sleep(300);

            const focusedHeading = await getDriver().switchTo().activeElement();
            expect(await focusedHeading.getText()).to.equal('Import');
          });

          describe('after processChunk is complete', () => {
            beforeEach(async () => {
              await getDriver().executeScript(
                'window.TEST_PROCESS_CHUNK_RESOLVE()'
              );
              await getDriver().wait(
                until.elementLocated(By.xpath('//*[contains(., "Complete")]')),
                200
              );
            });

            it('has active focus on completion message', async () => {
              const focusedHeading = await getDriver()
                .switchTo()
                .activeElement();
              expect(await focusedHeading.getText()).to.equal('Complete');
            });

            it('produces parsed data with correct fields', async () => {
              const parsedData = await getDriver().executeScript(
                'return window.TEST_PROCESS_CHUNK_ROWS'
              );
              const chunkInfo = await getDriver().executeScript(
                'return window.TEST_PROCESS_CHUNK_INFO'
              );

              expect(parsedData).to.deep.equal([
                { fieldA: 'AAAA' },
                { fieldA: 'EEEE' }
              ]);
              expect(chunkInfo).to.deep.equal({ startIndex: 0 });
            });

            it('does not show any interactable buttons', async () => {
              const anyButtons = await getDriver().findElements(
                By.xpath('//button')
              );

              expect(anyButtons.length).to.equal(1);
              expect(await anyButtons[0].getAttribute('aria-label')).to.equal(
                'Go to previous step'
              );
              expect(await anyButtons[0].getAttribute('disabled')).to.equal(
                'true'
              );
            });
          });
        });
      });
    });
  });
}).timeout(testTimeoutMs);
