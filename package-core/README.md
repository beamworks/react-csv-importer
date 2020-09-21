# React CSV Importer

This library provides an uploader + CSV parser + raw file preview + UI for custom user column
mapping, all in one.

Use this in your web app's bulk data import screen to allow users to drop a file for upload,
preview the raw uploaded data before parsing and pick which columns to import.

[Try the live demo app](https://react-csv-importer.vercel.app/).

![React CSV Importer usage demo](https://github.com/beamworks/react-csv-importer/raw/59f967c13bbbd20eb2a663538797dd718f9bc57e/package-core/react-csv-importer-demo-20200915.gif)

The UI theme is standalone (has no external dependencies such as Material UI) and tailored to
universally fit within most application design frameworks. Interface elements are tested for screen
reader accessibility and keyboard-only usage.

Feature summary:

- raw file preview
- user-selectable column mapping
- optional fields
- self-contained styling
- arbitrary CSV file size (true streaming support)
- screen reader a11y
- keyboard a11y

## Example Usage

```js
import { Importer, ImporterField } from 'react-csv-importer';

<Importer
  chunkSize={10000} // optional, internal parsing chunk size in bytes
  restartable={false} // optional, lets user choose to upload another file when import is complete
  onStart={() => {
    // optional, invoked when user has mapped columns and started import
    prepMyAppForIncomingData();
  }}
  processChunk={async (rows) => {
    // required, receives a list of parsed objects based on user column mapping
    // (if this returns a promise, the widget will wait for it before parsing more data)
    for (row of rows) {
      await myAppMethod(row);
    }
  }}
  onComplete={() => {
    // optional, invoked right after import is done (but user did not dismiss/reset the widget yet)
    showMyAppToastNotification();
  }}
  onClose={() => {
    // optional, invoked when import is done and user clicked "Finish"
    // (if this is not specified, the widget lets the user upload another file)
    goToMyAppNextPage();
  }}
>
  <ImporterField name="name" label="Name" />
  <ImporterField name="email" label="Email" />
  <ImporterField name="dob" label="Date of Birth" optional />
  <ImporterField name="postalCode" label="Postal Code" optional />
</Importer>;
```

## Dependencies

- [PapaParse](https://www.papaparse.com/) for CSV parsing
- [react-dropzone](https://react-dropzone.js.org/) for file upload
- [react-use-gesture](https://github.com/react-spring/react-use-gesture) for drag-and-drop
