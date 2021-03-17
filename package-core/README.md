# React CSV Importer

![https://www.npmjs.com/package/react-csv-importer](https://img.shields.io/npm/v/react-csv-importer) ![https://github.com/beamworks/react-csv-importer/actions](https://github.com/beamworks/react-csv-importer/actions/workflows/test.yml/badge.svg)

This library combines an uploader + CSV parser + raw file preview + UI for custom user column
mapping, all in one. Relies on the popular PapaParse CSV library to preview and process file contents directly in the browser.

Use this in your web app's bulk data import screen to allow users to drop a file for upload,
preview the raw uploaded data before parsing and pick which columns to import. Your front-end application logic directly receives the resulting array of JSON objects in reasonable-sized chunks: you can then validate and send the data to the backend in any final format it requires instead of raw CSV.

[Try the live editable code sandbox](https://codesandbox.io/s/github/beamworks/react-csv-importer/tree/master/demo-sandbox) or see the [themed demo app](https://react-csv-importer.vercel.app/).

![React CSV Importer usage demo](https://github.com/beamworks/react-csv-importer/raw/59f967c13bbbd20eb2a663538797dd718f9bc57e/package-core/react-csv-importer-demo-20200915.gif)

The UI theme is standalone (no external dependencies such as Material UI) and tailored to
universally fit within most application design frameworks. Interface elements are tested for screen
reader accessibility and keyboard-only usage.

Feature summary:

- uses Papa Parse library
- raw file preview
- auto-map fields to matching column names
- user-selectable column mapping (drag-drop UI)
- optional fields
- self-contained styling
- strip leading BOM character in data
- arbitrary CSV file size (true streaming support)
- runs entirely in-browser
- screen reader a11y
- keyboard a11y

## Install

```sh
# using NPM
npm install --save react-csv-importer

# using Yarn
yarn add react-csv-importer
```

## Example Usage

```js
import { Importer, ImporterField } from 'react-csv-importer';

// include the widget CSS file whichever way your bundler supports it
import 'react-csv-importer/dist/index.css';

// in your component code:
<Importer
  chunkSize={10000} // optional, internal parsing chunk size in bytes
  assumeNoHeaders={false} // optional, keeps "data has headers" checkbox off by default
  restartable={false} // optional, lets user choose to upload another file when import is complete
  onStart={() => {
    // optional, invoked when user has mapped columns and started import
    prepMyAppForIncomingData();
  }}
  processChunk={async (rows) => {
    // required, receives a list of parsed objects based on defined fields and user column mapping;
    // may be called several times if file is large
    // (if this callback returns a promise, the widget will wait for it before parsing more data)
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

  // CSV options passed directly to PapaParse if specified:
  // delimiter={...}
  // newline={...}
  // quoteChar={...}
  // escapeChar={...}
  // comments={...}
  // skipEmptyLines={...}
  // delimitersToGuess={...}
>
  <ImporterField name="name" label="Name" />
  <ImporterField name="email" label="Email" />
  <ImporterField name="dob" label="Date of Birth" optional />
  <ImporterField name="postalCode" label="Postal Code" optional />
</Importer>;
```

In the above example, if the user uploads a CSV file with column headers "Name", "Email" and so on, the columns will be automatically matched to fields with same labels. If any of the headers do not match, the user will have an opportunity to manually remap columns to the defined fields.

## Dependencies

- [Papa Parse](https://www.papaparse.com/) for CSV parsing
- [react-dropzone](https://react-dropzone.js.org/) for file upload
- [react-use-gesture](https://github.com/react-spring/react-use-gesture) for drag-and-drop

## Local Development

Perform local `git clone`, etc. Then ensure modules are installed:

```sh
yarn # root folder only needs this for Husky pre-commit triggers
cd package-core
yarn # main package dev dependencies
```

Most of the interesting stuff is inside `package-core` folder.

To start Storybook to have a hot-reloaded local sandbox:

```sh
yarn storybook
```

To run the end-to-end test suite:

```sh
yarn test
```

## Changes

- 0.4.0
  - auto-assign column headers
- 0.3.0
  - allow passing PapaParse config options
- 0.2.3
  - tweak TS compilation targets
  - live editable sandbox link in docs
- 0.2.2
  - empty file checks
  - fix up package metadata
  - extra docs
- 0.2.1
  - update index.d.ts generation
- 0.2.0
  - bundling core package using Webpack
  - added source maps
- 0.1.0
  - first beta release
  - true streaming support using shim for PapaParse
  - lifecycle hooks receive info about the import
