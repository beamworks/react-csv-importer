/* eslint-disable @typescript-eslint/explicit-module-boundary-types -- all exports are ImporterLocale which is already fully typed */

export interface ImporterLocale {
  components: {
    ColumnDragCard: {
      columnCardDummyHeader: string;
      getColumnCardHeader: (code: string) => string;
    };
    ColumnDragSourceArea: {
      dragSourceAreaCaption: string;
      getDragSourcePageIndicator: (
        currentPage: number,
        pageCount: number
      ) => string;
      getDragSourceActiveStatus: (columnCode: string) => string;
      nextColumnsTooltip: string;
      previousColumnsTooltip: string;
    };
    ColumnDragTargetArea: {
      dragTargetAreaCaption: string;
    };
    ColumnPicker: {
      requiredFieldsError: string;
      stepSubtitle: string;
    };
    FileSelector: {
      initialDragDropPrompt: string;
      activeDragDropPrompt: string;
    };
    FormatErrorMessage: {
      goBackButton: string;
    };
    FileStep: {
      getImportError: (message: string) => string;
      rawFileContentsHeading: string;
      previewImportHeading: string;
      dataHasHeadersCheckbox: string;
      previewLoadingStatus: string;
    };
    FormatRawPreview: {
      getDataFormatError: (message: string) => string;
    };
    ImporterFrame: {
      goToPreviousStepTooltip: string;
      nextButton: string;
    };
    ProgressDisplay: {
      stepSubtitle: string;
      uploadMoreButton: string;
      finishButton: string;
      statusError: string;
      statusComplete: string;
      statusPending: string;
      processedRowsLabel: string;
    };
    SourceBox: {
      clearAssignmentTooltip: string;
      selectColumnTooltip: string;
      unselectColumnTooltip: string;
    };
    TargetBox: {
      getDragTargetOptionalCaption: (field: string) => string;
      getDragTargetRequiredCaption: (field: string) => string;
      dragTargetPlaceholder: string;
      getDragTargetAssignTooltip: (columnCode: string) => string;
      dragTargetClearTooltip: string;
    };
  };
}

export const enUS: ImporterLocale = {
  components: {
    ColumnDragCard: {
      columnCardDummyHeader: 'Unassigned field',
      getColumnCardHeader: (code) => `Column ${code}`
    },
    ColumnDragSourceArea: {
      dragSourceAreaCaption: 'Columns to import',
      getDragSourcePageIndicator: (currentPage: number, pageCount: number) =>
        `Page ${currentPage} of ${pageCount}`,
      getDragSourceActiveStatus: (columnCode: string) =>
        `Assigning column ${columnCode}`,
      nextColumnsTooltip: 'Show next columns',
      previousColumnsTooltip: 'Show previous columns'
    },
    ColumnDragTargetArea: {
      dragTargetAreaCaption: 'Target fields'
    },
    ColumnPicker: {
      requiredFieldsError: 'Please assign all required fields',
      stepSubtitle: 'Select Columns'
    },
    FileSelector: {
      initialDragDropPrompt:
        'Drag-and-drop CSV file here, or click to select in folder',
      activeDragDropPrompt: 'Drop CSV file here...'
    },
    FileStep: {
      getImportError: (message) => `Import error: ${message}`,
      rawFileContentsHeading: 'Raw File Contents',
      previewImportHeading: 'Preview Import',
      dataHasHeadersCheckbox: 'Data has headers',
      previewLoadingStatus: 'Loading preview...'
    },
    FormatRawPreview: {
      getDataFormatError: (message) =>
        `Please check data formatting: ${message}`
    },
    FormatErrorMessage: {
      goBackButton: 'Go Back'
    },
    ImporterFrame: {
      goToPreviousStepTooltip: 'Go to previous step',
      nextButton: 'Next'
    },
    ProgressDisplay: {
      stepSubtitle: 'Import',
      uploadMoreButton: 'Upload More',
      finishButton: 'Finish',
      statusError: 'Could not import',
      statusComplete: 'Complete',
      statusPending: 'Importing...',
      processedRowsLabel: 'Processed rows:'
    },
    SourceBox: {
      clearAssignmentTooltip: 'Clear column assignment',
      selectColumnTooltip: 'Select column for assignment',
      unselectColumnTooltip: 'Unselect column'
    },
    TargetBox: {
      getDragTargetOptionalCaption: (field) => `${field} (optional)`,
      getDragTargetRequiredCaption: (field) => `${field} (required)`,
      dragTargetPlaceholder: 'Drag column here',
      getDragTargetAssignTooltip: (columnCode: string) =>
        `Assign column ${columnCode}`,
      dragTargetClearTooltip: 'Clear column assignment'
    }
  }
};

export const deDE: ImporterLocale = {
  components: {
    ColumnDragCard: {
      columnCardDummyHeader: 'Nicht zugewiesenes Feld',
      getColumnCardHeader: (code) => `Spalte ${code}`
    },
    ColumnDragSourceArea: {
      dragSourceAreaCaption: 'Zu importierende Spalte',
      getDragSourcePageIndicator: (currentPage: number, pageCount: number) =>
        `Seite ${currentPage} von ${pageCount}`,
      getDragSourceActiveStatus: (columnCode: string) =>
        `Spalte ${columnCode} zuweisen`,
      nextColumnsTooltip: 'Nächste Spalten anzeigen',
      previousColumnsTooltip: 'Vorherige Spalten anzeigen'
    },
    ColumnDragTargetArea: {
      dragTargetAreaCaption: 'Zielfelder'
    },
    ColumnPicker: {
      requiredFieldsError:
        'Bitte weise allen nicht optionalen Spalten einen Wert zu',
      stepSubtitle: 'Spalten auswählen'
    },
    FileSelector: {
      initialDragDropPrompt:
        'CSV-Datei auf dieses Feld ziehen, oder klicken um eine Datei auszuwählen',
      activeDragDropPrompt: 'CSV-Datei auf dieses Feld ziehen...'
    },
    FileStep: {
      getImportError: (message) => `Fehler beim Import: ${message}`,
      rawFileContentsHeading: 'Originaler Datei-Inhalt',
      previewImportHeading: 'Import-Vorschau',
      dataHasHeadersCheckbox: 'Mit Kopfzeile',
      previewLoadingStatus: 'Vorschau wird geladen...'
    },
    FormatRawPreview: {
      getDataFormatError: (message: string) =>
        `Bitte Datenformat überprüfen: ${message}`
    },
    FormatErrorMessage: {
      goBackButton: 'Zurück'
    },
    ImporterFrame: {
      goToPreviousStepTooltip: 'Zum vorherigen Schritt',
      nextButton: 'Weiter'
    },
    ProgressDisplay: {
      stepSubtitle: 'Importieren',
      uploadMoreButton: 'Weitere hochladen',
      finishButton: 'Abschließen',
      statusError: 'Konnte nicht importiert werden',
      statusComplete: 'Fertig',
      statusPending: 'Wird importiert...',
      processedRowsLabel: 'Verarbeitete Zeilen:'
    },
    SourceBox: {
      clearAssignmentTooltip: 'Zugewiesene Spalte entfernen',
      selectColumnTooltip: 'Spalte zum Zuweisen auswählen',
      unselectColumnTooltip: 'Spalte abwählen'
    },
    TargetBox: {
      getDragTargetOptionalCaption: (field) => `${field} (optional)`,
      getDragTargetRequiredCaption: (field) => `${field} (erforderlich)`,
      dragTargetPlaceholder: 'Spalte hierher ziehen',
      getDragTargetAssignTooltip: (columnCode: string) =>
        `Spalte ${columnCode} zuweisen`,
      dragTargetClearTooltip: 'Zugewiesene Spalte entfernen'
    }
  }
};
