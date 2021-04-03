// information for displaying a spreadsheet-style column
export interface Column {
  index: number; // position inside spreadsheet
  code: string; // A, B, ..., AA, AB, etc
  header?: string; // header, if present
  values: string[]; // sample preview values
}

// spreadsheet-style column code computation (A, B, ..., Z, AA, AB, ..., etc)
function generateColumnCode(value: number) {
  // ignore dummy index
  if (value < 0) {
    return '';
  }

  // first, determine how many base-26 letters there should be
  // (because the notation is not purely positional)
  let digitCount = 1;
  let base = 0;
  let next = 26;

  while (next <= value) {
    digitCount += 1;
    base = next;
    next = next * 26 + 26;
  }

  // then, apply normal positional digit computation on remainder above base
  let remainder = value - base;

  const digits = [];
  while (digits.length < digitCount) {
    const lastDigit = remainder % 26;
    remainder = Math.floor((remainder - lastDigit) / 26); // applying floor just in case

    // store ASCII code, with A as 0
    digits.unshift(65 + lastDigit);
  }

  return String.fromCharCode.apply(null, digits);
}

// prepare spreadsheet-like column display information for given raw data preview
export function generatePreviewColumns(
  firstRows: string[][],
  hasHeaders: boolean
): Column[] {
  const columnStubs = [...new Array(firstRows[0].length)];

  return columnStubs.map((empty, index) => {
    const values = firstRows.map((row) => row[index] || '');

    const dataValues = [...values];
    const headerValue = hasHeaders ? values.shift() : undefined;

    return {
      index,
      code: generateColumnCode(index),
      header: headerValue,
      values: dataValues
    };
  });
}
