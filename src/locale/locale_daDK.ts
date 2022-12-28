import { ImporterLocale } from './ImporterLocale';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types -- all exports are ImporterLocale which is already fully typed */
export const daDK: ImporterLocale = {
  general: {
    goToPreviousStepTooltip: 'Gå til forrige trin'
  },

  fileStep: {
    initialDragDropPrompt:
      'Træk og slip CSV-fil her eller klik for at vælge fra en mappe',
    activeDragDropPrompt: 'Slip CSV-fil her...',

    getImportError: (message) => `Import-fejl: ${message}`,
    getDataFormatError: (message) =>
      `Kontrollér venligst data-formatering: ${message}`,
    goBackButton: 'Gå tilbage',
    nextButton: 'Vælg kolonner',

    rawFileContentsHeading: 'Rå filindhold',
    previewImportHeading: 'Forhåndsvis Import',
    dataHasHeadersCheckbox: 'Data sidehoved',
    previewLoadingStatus: 'Indlæser forhåndsvisning...'
  },

  fieldsStep: {
    stepSubtitle: 'Vælg kolonner',
    requiredFieldsError: 'Tildel venligst alle påkrævede felter',
    nextButton: 'Importér',

    dragSourceAreaCaption: 'Kolonner til import',
    getDragSourcePageIndicator: (currentPage: number, pageCount: number) =>
      `Side ${currentPage} af ${pageCount}`,
    getDragSourceActiveStatus: (columnCode: string) =>
      `Tildeler kolonne ${columnCode}`,
    nextColumnsTooltip: 'Vis næste kolonner',
    previousColumnsTooltip: 'Vis forrige kolonner',
    clearAssignmentTooltip: 'Ryd kolonne-tildeling',
    selectColumnTooltip: 'Vælg kolonne til tildeling',
    unselectColumnTooltip: 'Fravælg kolonne',

    dragTargetAreaCaption: 'Mål-felter',
    getDragTargetOptionalCaption: (field) => `${field} (valgfri)`,
    getDragTargetRequiredCaption: (field) => `${field} (påkrævet)`,
    dragTargetPlaceholder: 'Træk kolonne hertil',
    getDragTargetAssignTooltip: (columnCode: string) =>
      `Tildel kolonne ${columnCode}`,
    dragTargetClearTooltip: 'Ryd kolonne-tildeling',

    columnCardDummyHeader: 'Disponibelt felt',
    getColumnCardHeader: (code) => `Column ${code}`
  },

  progressStep: {
    stepSubtitle: 'Importér',
    uploadMoreButton: 'Upload Mere',
    finishButton: 'Færdiggør',
    statusError: 'Kunne ikke importere',
    statusComplete: 'Færdig',
    statusPending: 'Importerer...',
    processedRowsLabel: 'Processerede rækker:'
  }
};
