import React, { useState, useMemo, useEffect, useRef } from 'react';

import { useLocale } from '../../locale/LocaleContext';
import { Field } from './FieldsStep';

import './DropdownField.scss';

export const DropdownField: React.FC<{ field: Field }> = ({ field }) => {
  const l10n = useLocale('fieldsStep');

  return (
    <div
      className="CSVImporter_DropdownField"
      aria-label={
        field.isOptional
          ? l10n.getDragTargetOptionalCaption(field.label)
          : l10n.getDragTargetRequiredCaption(field.label)
      }
    >
      <div className="CSVImporter_DropdownField__label" aria-hidden>
        {field.label}
        {field.isOptional ? null : <b>*</b>}
      </div>
    </div>
  );
};
