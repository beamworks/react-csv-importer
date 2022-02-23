/* eslint-disable @typescript-eslint/explicit-module-boundary-types -- all exports are ImporterLocale which is already fully typed */

export interface ImporterLocale {
  components: {
    ColumnDragCard: {
      dummyHeader: string;
      getHeader: (code: string) => string;
    };
    ColumnDragSourceArea: {
      ariaLabel: string;
      getPageIndicator: (currentPage: number, pageCount: number) => string;
      getAssigningColumn: (columnCode: string) => string;
      nextColumns: string;
      previousColumns: string;
    };
    ColumnDragTargetArea: {
      ariaLabel: string;
    };
    ColumnPicker: {
      requiredFieldsError: string;
      subtitle: string;
    };
    FileSelector: {
      default: string;
      dragActive: string;
    };
    FormatErrorMessage: {
      back: string;
    };
    FileStep: {
      importError: string;
      rawFileContents: string;
      previewImport: string;
      hasHeaders: string;
      loadingPreview: string;
    };
    FormatRawPreview: {
      getWarning: (warningMessage: string) => string;
    };
    ImporterFrame: {
      previousStep: string;
      nextStep: string;
    };
    ProgressDisplay: {
      subtitle: string;
      uploadMore: string;
      finish: string;
      statusError: string;
      statusComplete: string;
      statusPending: string;
      processedRows: string;
    };
    SourceBox: {
      clearAssignment: string;
      selectColumn: string;
      unselectColumn: string;
    };
    TargetBox: {
      optionalAriaLabel: string;
      requiredAriaLabel: string;
      boxPlaceholder: string;
      getBoxValueAction: (columnCode: string) => string;
      clear: string;
    };
  };
}

export const enUS: ImporterLocale = {
  components: {
    ColumnDragCard: {
      dummyHeader: 'Unassigned field',
      getHeader: (code) => `Column ${code}`
    },
    ColumnDragSourceArea: {
      ariaLabel: 'Columns to import',
      getPageIndicator: (currentPage: number, pageCount: number) =>
        `Page ${currentPage} of ${pageCount}`,
      getAssigningColumn: (columnCode: string) =>
        `Assigning column ${columnCode}`,
      nextColumns: 'Show next columns',
      previousColumns: 'Show previous columns'
    },
    ColumnDragTargetArea: {
      ariaLabel: 'Target fields'
    },
    ColumnPicker: {
      requiredFieldsError: 'Please assign all required fields',
      subtitle: 'Select Columns'
    },
    FileSelector: {
      default: 'Drag-and-drop CSV file here, or click to select in folder',
      dragActive: 'Drop CSV file here...'
    },
    FileStep: {
      importError: 'Import error:',
      rawFileContents: 'Raw File Contents',
      previewImport: 'Preview Import',
      hasHeaders: 'Data has headers',
      loadingPreview: 'Loading preview...'
    },
    FormatRawPreview: {
      getWarning: (warningMessage: string) =>
        `${warningMessage}: please check data formatting`
    },
    FormatErrorMessage: {
      back: 'Go Back'
    },
    ImporterFrame: {
      previousStep: 'Go to previous step',
      nextStep: 'Next'
    },
    ProgressDisplay: {
      subtitle: 'Import',
      uploadMore: 'Upload More',
      finish: 'Finish',
      statusError: 'Could not import',
      statusComplete: 'Complete',
      statusPending: 'Importing...',
      processedRows: 'Processed rows:'
    },
    SourceBox: {
      clearAssignment: 'Clear column assignment',
      selectColumn: 'Select column for assignment',
      unselectColumn: 'Unselect column'
    },
    TargetBox: {
      optionalAriaLabel: 'optional',
      requiredAriaLabel: 'required',
      boxPlaceholder: 'Drag column here',
      getBoxValueAction: (columnCode: string) => `Assign column ${columnCode}`,
      clear: 'Clear column assignment'
    }
  }
};

export const deDE: ImporterLocale = {
  components: {
    ColumnDragCard: {
      dummyHeader: 'Nicht zugewiesenes Feld',
      getHeader: (code) => `Spalte ${code}`
    },
    ColumnDragSourceArea: {
      ariaLabel: 'Zu importierende Spalte',
      getPageIndicator: (currentPage: number, pageCount: number) =>
        `Seite ${currentPage} von ${pageCount}`,
      getAssigningColumn: (columnCode: string) =>
        `Spalte ${columnCode} zuweisen`,
      nextColumns: 'Nächste Spalten anzeigen',
      previousColumns: 'Vorherige Spalten anzeigen'
    },
    ColumnDragTargetArea: {
      ariaLabel: 'Zielfelder'
    },
    ColumnPicker: {
      requiredFieldsError:
        'Bitte weise allen nicht optionalen Spalten einen Wert zu',
      subtitle: 'Spalten auswählen'
    },
    FileSelector: {
      default:
        'CSV-Datei auf dieses Feld ziehen, oder klicken um eine Datei auszuwählen',
      dragActive: 'CSV-Datei auf dieses Feld ziehen...'
    },
    FileStep: {
      importError: 'Fehler beim Import:',
      rawFileContents: 'Originaler Datei-Inhalt',
      previewImport: 'Import-Vorschau',
      hasHeaders: 'Mit Kopfzeile',
      loadingPreview: 'Vorschau wird geladen...'
    },
    FormatRawPreview: {
      getWarning: (warningMessage: string) =>
        `${warningMessage}: bitte Datenformat überprüfen`
    },
    FormatErrorMessage: {
      back: 'Zurück'
    },
    ImporterFrame: {
      previousStep: 'Zum vorherigen Schritt',
      nextStep: 'Weiter'
    },
    ProgressDisplay: {
      subtitle: 'Importieren',
      uploadMore: 'Weitere hochladen',
      finish: 'Abschließen',
      statusError: 'Konnte nicht importiert werden',
      statusComplete: 'Fertig',
      statusPending: 'Wird importiert...',
      processedRows: 'Verarbeitete Zeilen:'
    },
    SourceBox: {
      clearAssignment: 'Zugewiesene Spalte entfernen',
      selectColumn: 'Spalte zum Zuweisen auswählen',
      unselectColumn: 'Spalte abwählen'
    },
    TargetBox: {
      optionalAriaLabel: 'optional',
      requiredAriaLabel: 'erforderlich',
      boxPlaceholder: 'Spalte hierher ziehen',
      getBoxValueAction: (columnCode: string) =>
        `Spalte ${columnCode} zuweisen`,
      clear: 'Zugewiesene Spalte entfernen'
    }
  }
};
