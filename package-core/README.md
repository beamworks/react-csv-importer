# React CSV Importer

This library provides an uploader + CSV parser + raw file preview + UI for custom user column
mapping, all in one.

Use this in your web app's bulk data import screen to allow users to drop a file for upload,
preview the raw uploaded data before parsing and pick which columns to import.

The UI theme is standalone (has no external dependencies such as Material UI) and tailored to
universally fit within most application design frameworks. Interface elements are tested for screen
reader accessibility and keyboard-only usage.

Example usage:

```js
import { Importer, ImporterField } from 'react-csv-importer';

<Importer
  callback={async (rows) => {
    for (row of rows) {
      // console.log('saving row', row)
      await myAppMethod(row);
    }
  }}
  onFinish={() => {
    // console.log('import finished');
    goToMyAppNextPage();
  }}
>
  <ImporterField name="name" label="Name" />
  <ImporterField name="email" label="Email" />
  <ImporterField name="dob" label="Date of Birth" optional />
  <ImporterField name="postalCode" label="Postal Code" optional />
</Importer>;
```
