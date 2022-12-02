import { ImporterLocale } from './ImporterLocale';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types -- all exports are ImporterLocale which is already fully typed */
export const itIT: ImporterLocale = {
  general: {
    goToPreviousStepTooltip: 'Torna indietro'
  },

  fileStep: {
    initialDragDropPrompt:
      'Trascina qui il file CSV, o clicca per selezionarlo dal PC',
    activeDragDropPrompt: 'Rilascia qui il file CSV...',

    getImportError: (message) => `Errore durante l'importazione: ${message}`,
    getDataFormatError: (message) =>
      `Si prega di controllare il formato dei dati: ${message}`,
    goBackButton: 'Torna indietro',
    nextButton: 'Seleziona le colonne',

    rawFileContentsHeading: 'Contenuto delfile caricato',
    previewImportHeading: 'Anteprima dei dati',
    dataHasHeadersCheckbox: 'Intestazione presente nel file',
    previewLoadingStatus: 'Caricamento anteprima...'
  },

  fieldsStep: {
    stepSubtitle: 'Seleziona le colonne',
    requiredFieldsError: 'Si prega di assegnare tutte le colonne richieste',
    nextButton: 'Importa',

    dragSourceAreaCaption: 'Colonne da importare',
    getDragSourcePageIndicator: (currentPage: number, pageCount: number) =>
      `Pagina ${currentPage} di ${pageCount}`,
    getDragSourceActiveStatus: (columnCode: string) =>
      `Assegnamento alla colonna ${columnCode}`,
    nextColumnsTooltip: 'Mostra colonna successiva',
    previousColumnsTooltip: 'Mostra colonna precedente',
    clearAssignmentTooltip: 'Cancella tutti gli assegnamenti delle colonne',
    selectColumnTooltip: 'Seleziona una colonna da assegnare',
    unselectColumnTooltip: 'Deseleziona colonna',

    dragTargetAreaCaption: 'Campi richiesti',
    getDragTargetOptionalCaption: (field) => `${field} (opzionale)`,
    getDragTargetRequiredCaption: (field) => `${field} (obbligatorio)`,
    dragTargetPlaceholder: 'Trascina qui la colonna',
    getDragTargetAssignTooltip: (columnCode: string) =>
      `Assegnamento alla colonna ${columnCode}`,
    dragTargetClearTooltip: 'Cancella gli assegnamenti alla colonna',

    columnCardDummyHeader: 'Campo non assegnato',
    getColumnCardHeader: (code) => `Column ${code}`
  },

  progressStep: {
    stepSubtitle: 'Importa',
    uploadMoreButton: 'Carica altri dati',
    finishButton: 'Fine',
    statusError: 'Errore di caricamento',
    statusComplete: 'Completato',
    statusPending: 'Caricamento...',
    processedRowsLabel: 'Righe processate:'
  }
};
