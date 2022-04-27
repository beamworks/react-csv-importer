import React, { useState, useMemo, useEffect, useRef } from 'react';

import { FieldAssignmentMap } from '../../parser';
import { FileStepState } from '../file-step/FileStep';
import { ImporterFrame } from '../ImporterFrame';
import { FieldsStepState, Field } from './FieldsStep';
import { DropdownField } from './DropdownField';
import {
  generatePreviewColumns,
  generateColumnCode,
  Column
} from './ColumnPreview';
import { useLocale } from '../../locale/LocaleContext';

export const FieldsDropdownStep: React.FC<{
  fileState: FileStepState;
  fields: Field[];
  prevState: FieldsStepState | null;
  onChange: (state: FieldsStepState) => void;
  onAccept: () => void;
  onCancel: () => void;
}> = ({ fileState, fields, prevState, onChange, onAccept, onCancel }) => {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const columns = useMemo<Column[]>(
    () =>
      generatePreviewColumns(
        fileState.firstRows,
        fileState.hasHeaders
      ).map((item) => ({ ...item, code: generateColumnCode(item.index) })),
    [fileState]
  );

  const l10n = useLocale('fieldsStep');

  return (
    <ImporterFrame
      fileName={fileState.file.name}
      subtitle={l10n.stepSubtitle}
      onCancel={onCancel}
      onNext={() => {
        // @todo validation logic
      }}
      nextLabel={l10n.nextButton}
    >
      {fields.map((field) => {
        return <DropdownField key={field.name} field={field} />;
      })}
    </ImporterFrame>
  );
};
