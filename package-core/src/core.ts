export type BaseRow = { [name: string]: unknown };

export type ParseCallback<Row extends BaseRow> = (
  rows: Row[]
) => void | Promise<void>;
