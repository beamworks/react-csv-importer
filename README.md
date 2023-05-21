# React CSV Importer

[![https://www.npmjs.com/package/react-csv-importer](https://img.shields.io/npm/v/react-csv-importer)](https://www.npmjs.com/package/react-csv-importer) [![https://github.com/beamworks/react-csv-importer/actions](https://github.com/beamworks/react-csv-importer/actions/workflows/test.yml/badge.svg)](https://github.com/beamworks/react-csv-importer/actions)

This library combines an uploader + CSV parser + raw file preview + UI for custom user column
mapping, all in one.

Use this to provide a typical bulk data import experience:

- 📤 drag-drop or select a file for upload
- 👓 preview the raw uploaded data
- ✏ pick which columns to import
- ⏳ wait for backend logic to finish processing data

![React CSV Importer usage demo](https://github.com/beamworks/react-csv-importer/raw/59f967c13bbbd20eb2a663538797dd718f9bc57e/package-core/react-csv-importer-demo-20200915.gif)

[Try it in the live code sandbox](https://codesandbox.io/s/github/beamworks/react-csv-importer/tree/master/demo-sandbox)

### Feature summary:

- raw file preview
- drag-drop UI to remap input columns as needed
- i18n (EN, DA, DE, IT, PT, TR or custom)
- screen reader accessibility (yes, really!)
- keyboard a11y
- standalone CSS stylesheet (no frameworks required)
- existing parser implementation: Papa Parse CSV
- TypeScript support

### Enterprise-level data file handling:

- 1GB+ CSV file size (true streaming support without crashing browser)
- automatically strip leading BOM character in data
- async parsing logic (pause file read while your app makes backend updates)
- fixes a [multibyte streaming issue in PapaParse](https://github.com/mholt/PapaParse/issues/908)

## Install

```sh
# using NPM
npm install --save react-csv-importer

# using Yarn
yarn add react-csv-importer
```

Make sure that the bundled CSS stylesheet (`/dist/index.css`) is present in your app's page or bundle.

This package is easy to fork with your own customizations, and you can use your fork directly as a [Git dependency](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#git-urls-as-dependencies) in any of your projects, see below. For simple CSS customization you can also just override the built-in styling with your own style rules.

## How It Works

Render the React CSV Importer UI component where you need it in your app. This will present the upload widget to the user. After a file is selected and reviewed by the user, CSV file data is parsed in-browser and passed to your front-end code as a list of JSON objects. Each object will have fields corresponding to the columns that the user selected.

Large files (can be up to 1GB and more!) are parsed in chunks: return a promise from your data handler and the file reader will pause until you are ready for more data.

Instead of a custom CSV parser this library uses the popular Papa Parse CSV reader. Because the file reader runs in-browser, your backend (if you have one) never has to deal with raw CSV data.

## Example Usage

```js
import { Importer, ImporterField } from 'react-csv-importer';

// include the widget CSS file whichever way your bundler supports it
import 'react-csv-importer/dist/index.css';

// in your component code:
<Importer
  dataHandler={async (rows, { startIndex }) => {
    // required, may be called several times
    // receives a list of parsed objects based on defined fields and user column mapping;
    // (if this callback returns a promise, the widget will wait for it before parsing more data)
    for (row of rows) {
      await myAppMethod(row);
    }
  }}
  defaultNoHeader={false} // optional, keeps "data has headers" checkbox off by default
  restartable={false} // optional, lets user choose to upload another file when import is complete
  onStart={({ file, preview, fields, columnFields }) => {
    // optional, invoked when user has mapped columns and started import
    prepMyAppForIncomingData();
  }}
  onComplete={({ file, preview, fields, columnFields }) => {
    // optional, invoked right after import is done (but user did not dismiss/reset the widget yet)
    showMyAppToastNotification();
  }}
  onClose={({ file, preview, fields, columnFields }) => {
    // optional, if this is specified the user will see a "Finish" button after import is done,
    // which will call this when clicked
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
  // chunkSize={...} // defaults to 10000
  // encoding={...} // defaults to utf-8, see FileReader API
>
  <ImporterField name="name" label="Name" />
  <ImporterField name="email" label="Email" />
  <ImporterField name="dob" label="Date of Birth" optional />
  <ImporterField name="postalCode" label="Postal Code" optional />
</Importer>;
```

In the above example, if the user uploads a CSV file with column headers "Name", "Email" and so on, the columns will be automatically matched to fields with same labels. If any of the headers do not match, the user will have an opportunity to manually remap columns to the defined fields.

The `preview` object available to some callbacks above contains a snippet of CSV file information (only the first portion of the file is read, not the entire thing). The structure is:

```js
{
  rawData: '...', // raw string contents of first file chunk
  columns: [ // array of preview columns, e.g.:
    { index: 0, header: 'Date', values: [ '2020-09-20', '2020-09-25' ] },
    { index: 1, header: 'Name', values: [ 'Alice', 'Bob' ] }
  ],
  skipHeaders: false, // true when user selected that data has no headers
  parseWarning: undefined, // any non-blocking warning object produced by Papa Parse
}
```

Importer component children may be defined as a render-prop function that receives an object with `preview` and `file` fields (see above). It can then, for example, dynamically return different fields depending which headers are present in the CSV.

For more, please see [storybook examples](src/components/Importer.stories.tsx).

## Internationalization (i18n) and Localization (l10n)

You can swap the text used in the UI to a different locale.

```
import { Importer, deDE } from 'react-csv-importer';

// provide the locale to main UI
<Importer
  locale={deDE}
  // normal props, etc
/>
```

These locales are provided as part of the NPM module:

- `en-US`
- `de-DE`
- `it-IT`
- `pt-BR`
- `da-DK`
- `tr-TR`

You can also pass your own fully custom locale definition as the locale value. See `ImporterLocale` interface in `src/locale` for the full definition, and use an existing locale like `en-US` as basis. For better performance, please ensure that the customized locale value does not change on every render.

## Dependencies

- [Papa Parse](https://www.papaparse.com/) for CSV parsing
- [react-dropzone](https://react-dropzone.js.org/) for file upload
- [@use-gesture/react](https://github.com/pmndrs/use-gesture) for drag-and-drop

## Local Development

Perform local `git clone`, etc. Then ensure modules are installed:

```sh
yarn
```

To start Storybook to have a hot-reloaded local sandbox:

```sh
yarn storybook
```

To run the end-to-end test suite:

```sh
yarn test
```

You can use your own fork of this library in your own project by referencing the forked repo as a [Git dependency](https://docs.npmjs.com/cli/v7/configuring-npm/package-json#git-urls-as-dependencies). NPM will then run the `prepare` script, which runs the same Webpack/dist command as when the NPM package is published, so your custom dependency should work just as conveniently as the stock NPM version. Of course if your custom fixes could be useful to the rest of us then please submit a PR to this repo!

## Changes

- 0.8.1
  - fix double-start issue for React 18 dev mode
- 0.8.0
  - more translations (thanks [**@p-multani-0**](https://github.com/p-multani-0), [**@GuilhermeMelati**](https://github.com/GuilhermeMelati), [**@tobiaskkd**](https://github.com/tobiaskkd) and [**@memoricab**](https://github.com/memoricab))
  - refactor to work with later versions of @use-gesture/react (thanks [**@dbismut**](https://github.com/dbismut))
  - upgrade to newer version of react-dropzone
  - rename assumeNoHeaders to defaultNoHeader (with deprecation warning)
  - rename processChunk to dataHandler (with deprecation warning)
  - expose display width customization (`displayColumnPageSize`, `displayFieldRowSize`)
  - bug fixes for button type and labels
- 0.7.1
  - fix peerDependencies for React 18+ (thanks [**@timarney**](https://github.com/timarney))
  - hide Finish button by default
  - button label tweaks
- 0.7.0
  - add i18n (thanks [**@tstehr**](https://github.com/tstehr) and [**@Valodim**](https://github.com/Valodim))
- 0.6.0
  - improve multibyte stream parsing safety
  - support all browser encodings via TextDecoder
  - remove readable-web-to-node-stream dependency
  - bug fix for preview of short no-EOL files
- 0.5.2
  - update readable-web-to-node-stream to have stream shim
  - use npm prepare script for easier fork installs
- 0.5.1
  - correctly use custom Papa Parse config for the main processing stream
  - drag-drop fixes on scrolled pages
  - bug fixes for older Safari, mobile issues
- 0.5.0
  - report file preview to callbacks and render-prop
  - report startIndex in processChunk callback
- 0.4.1
  - clearer error display
  - add more information about ongoing import
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
