/* eslint-disable @typescript-eslint/explicit-module-boundary-types -- all exports are ImporterLocale which is already fully typed */

export interface ImporterLocale {
  components: {
    ColumnDragCard: {
      l10n_dummyHeader: string;
      l10n_getHeader: (code: string) => string;
    };
    ColumnDragSourceArea: {
      l10n_ariaLabel: string;
      l10n_getPageIndicator: (currentPage: number, pageCount: number) => string;
      l10n_getAssigningColumn: (columnCode: string) => string;
      l10n_nextColumns: string;
      l10n_previousColumns: string;
    };
    ColumnDragTargetArea: {
      l10n_ariaLabel: string;
    };
    ColumnPicker: {
      l10n_requiredFieldsError: string;
      l10n_subtitle: string;
    };
    FileSelector: {
      l10n_default: string;
      l10n_dragActive: string;
    };
    FormatErrorMessage: {
      l10n_back: string;
    };
    FileStep: {
      l10n_importError: string;
      l10n_rawFileContents: string;
      l10n_previewImport: string;
      l10n_hasHeaders: string;
      l10n_loadingPreview: string;
    };
    FormatRawPreview: {
      l10n_getWarning: (warningMessage: string) => string;
    };
    ImporterFrame: {
      l10n_previousStep: string;
      l10n_nextStep: string;
    };
    ProgressDisplay: {
      l10n_subtitle: string;
      l10n_uploadMore: string;
      l10n_finish: string;
      l10n_statusError: string;
      l10n_statusComplete: string;
      l10n_statusPending: string;
      l10n_processedRows: string;
    };
    SourceBox: {
      l10n_clearAssignment: string;
      l10n_selectColumn: string;
      l10n_unselectColumn: string;
    };
    TargetBox: {
      l10n_optionalAriaLabel: string;
      l10n_requiredAriaLabel: string;
      l10n_boxPlaceholder: string;
      l10n_getBoxValueAction: (columnCode: string) => string;
      l10n_clear: string;
    };
  };
}

export const enUS: ImporterLocale = {
  components: {
    ColumnDragCard: {
      l10n_dummyHeader: 'Unassigned field',
      l10n_getHeader: (code) => `Column ${code}`
    },
    ColumnDragSourceArea: {
      l10n_ariaLabel: 'Columns to import',
      l10n_getPageIndicator: (currentPage: number, pageCount: number) =>
        `Page ${currentPage} of ${pageCount}`,
      l10n_getAssigningColumn: (columnCode: string) =>
        `Assigning column ${columnCode}`,
      l10n_nextColumns: 'Show next columns',
      l10n_previousColumns: 'Show previous columns'
    },
    ColumnDragTargetArea: {
      l10n_ariaLabel: 'Target fields'
    },
    ColumnPicker: {
      l10n_requiredFieldsError: 'Please assign all required fields',
      l10n_subtitle: 'Select Columns'
    },
    FileSelector: {
      l10n_default: 'Drag-and-drop CSV file here, or click to select in folder',
      l10n_dragActive: 'Drop CSV file here...'
    },
    FileStep: {
      l10n_importError: 'Import error:',
      l10n_rawFileContents: 'Raw File Contents',
      l10n_previewImport: 'Preview Import',
      l10n_hasHeaders: 'Data has headers',
      l10n_loadingPreview: 'Loading preview...'
    },
    FormatRawPreview: {
      l10n_getWarning: (warningMessage: string) =>
        `${warningMessage}: please check data formatting`
    },
    FormatErrorMessage: {
      l10n_back: 'Go Back'
    },
    ImporterFrame: {
      l10n_previousStep: 'Go to previous step',
      l10n_nextStep: 'Next'
    },
    ProgressDisplay: {
      l10n_subtitle: 'Import',
      l10n_uploadMore: 'Upload More',
      l10n_finish: 'Finish',
      l10n_statusError: 'Could not import',
      l10n_statusComplete: 'Complete',
      l10n_statusPending: 'Importing...',
      l10n_processedRows: 'Processed rows:'
    },
    SourceBox: {
      l10n_clearAssignment: 'Clear column assignment',
      l10n_selectColumn: 'Select column for assignment',
      l10n_unselectColumn: 'Unselect column'
    },
    TargetBox: {
      l10n_optionalAriaLabel: 'optional',
      l10n_requiredAriaLabel: 'required',
      l10n_boxPlaceholder: 'Drag column here',
      l10n_getBoxValueAction: (columnCode: string) =>
        `Assign column ${columnCode}`,
      l10n_clear: 'Clear column assignment'
    }
  }
};

export const deDE: ImporterLocale = {
  components: {
    ColumnDragCard: {
      l10n_dummyHeader: 'Nicht zugewiesenes Feld',
      l10n_getHeader: (code) => `Spalte ${code}`
    },
    ColumnDragSourceArea: {
      l10n_ariaLabel: 'Zu importierende Spalte',
      l10n_getPageIndicator: (currentPage: number, pageCount: number) =>
        `Seite ${currentPage} von ${pageCount}`,
      l10n_getAssigningColumn: (columnCode: string) =>
        `Spalte ${columnCode} zuweisen`,
      l10n_nextColumns: 'Nächste Spalten anzeigen',
      l10n_previousColumns: 'Vorherige Spalten anzeigen'
    },
    ColumnDragTargetArea: {
      l10n_ariaLabel: 'Zielfelder'
    },
    ColumnPicker: {
      l10n_requiredFieldsError:
        'Bitte weise allen nicht optionalen Spalten einen Wert zu',
      l10n_subtitle: 'Spalten auswählen'
    },
    FileSelector: {
      l10n_default:
        'CSV-Datei auf dieses Feld ziehen, oder klicken um eine Datei auszuwählen',
      l10n_dragActive: 'CSV-Datei auf dieses Feld ziehen...'
    },
    FileStep: {
      l10n_importError: 'Fehler beim Import:',
      l10n_rawFileContents: 'Originaler Datei-Inhalt',
      l10n_previewImport: 'Import-Vorschau',
      l10n_hasHeaders: 'Mit Kopfzeile',
      l10n_loadingPreview: 'Vorschau wird geladen...'
    },
    FormatRawPreview: {
      l10n_getWarning: (warningMessage: string) =>
        `${warningMessage}: bitte Datenformat überprüfen`
    },
    FormatErrorMessage: {
      l10n_back: 'Zurück'
    },
    ImporterFrame: {
      l10n_previousStep: 'Zum vorherigen Schritt',
      l10n_nextStep: 'Weiter'
    },
    ProgressDisplay: {
      l10n_subtitle: 'Importieren',
      l10n_uploadMore: 'Weitere hochladen',
      l10n_finish: 'Abschließen',
      l10n_statusError: 'Konnte nicht importiert werden',
      l10n_statusComplete: 'Fertig',
      l10n_statusPending: 'Wird importiert...',
      l10n_processedRows: 'Verarbeitete Zeilen:'
    },
    SourceBox: {
      l10n_clearAssignment: 'Zugewiesene Spalte entfernen',
      l10n_selectColumn: 'Spalte zum Zuweisen auswählen',
      l10n_unselectColumn: 'Spalte abwählen'
    },
    TargetBox: {
      l10n_optionalAriaLabel: 'optional',
      l10n_requiredAriaLabel: 'erforderlich',
      l10n_boxPlaceholder: 'Spalte hierher ziehen',
      l10n_getBoxValueAction: (columnCode: string) =>
        `Spalte ${columnCode} zuweisen`,
      l10n_clear: 'Zugewiesene Spalte entfernen'
    }
  }
};
