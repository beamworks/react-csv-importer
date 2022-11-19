/* eslint-disable @typescript-eslint/explicit-module-boundary-types -- all exports are ImporterLocale which is already fully typed */

export interface ImporterLocale {
  general: {
    goToPreviousStepTooltip: string;
  };

  fileStep: {
    initialDragDropPrompt: string;
    activeDragDropPrompt: string;

    getImportError: (message: string) => string;
    getDataFormatError: (message: string) => string;
    unsupportedFileFormatError: string;
    goBackButton: string;
    nextButton: string;

    rawFileContentsHeading: string;
    previewImportHeading: string;
    dataHasHeadersCheckbox: string;
    previewLoadingStatus: string;
  };

  fieldsStep: {
    stepSubtitle: string;
    requiredFieldsError: string;
    nextButton: string;

    dragSourceAreaCaption: string;
    getDragSourcePageIndicator: (
      currentPage: number,
      pageCount: number
    ) => string;
    getDragSourceActiveStatus: (columnCode: string) => string;
    nextColumnsTooltip: string;
    previousColumnsTooltip: string;
    clearAssignmentTooltip: string;
    selectColumnTooltip: string;
    unselectColumnTooltip: string;

    dragTargetAreaCaption: string;
    getDragTargetOptionalCaption: (field: string) => string;
    getDragTargetRequiredCaption: (field: string) => string;
    dragTargetPlaceholder: string;
    getDragTargetAssignTooltip: (columnCode: string) => string;
    dragTargetClearTooltip: string;

    columnCardDummyHeader: string;
    getColumnCardHeader: (code: string) => string;
  };

  progressStep: {
    stepSubtitle: string;
    uploadMoreButton: string;
    finishButton: string;
    statusError: string;
    statusComplete: string;
    statusPending: string;
    processedRowsLabel: string;
  };
}

export const enUS: ImporterLocale = {
  general: {
    goToPreviousStepTooltip: 'Go to previous step'
  },

  fileStep: {
    initialDragDropPrompt:
      'Drag-and-drop CSV file here, or click to select in folder',
    activeDragDropPrompt: 'Drop CSV file here...',

    getImportError: (message) => `Import error: ${message}`,
    getDataFormatError: (message) => `Please check data formatting: ${message}`,
    unsupportedFileFormatError: 'File format not supported',
    goBackButton: 'Go Back',
    nextButton: 'Choose columns',

    rawFileContentsHeading: 'Raw File Contents',
    previewImportHeading: 'Preview Import',
    dataHasHeadersCheckbox: 'Data has headers',
    previewLoadingStatus: 'Loading preview...'
  },

  fieldsStep: {
    stepSubtitle: 'Select Columns',
    requiredFieldsError: 'Please assign all required fields',
    nextButton: 'Import',

    dragSourceAreaCaption: 'Columns to import',
    getDragSourcePageIndicator: (currentPage: number, pageCount: number) =>
      `Page ${currentPage} of ${pageCount}`,
    getDragSourceActiveStatus: (columnCode: string) =>
      `Assigning column ${columnCode}`,
    nextColumnsTooltip: 'Show next columns',
    previousColumnsTooltip: 'Show previous columns',
    clearAssignmentTooltip: 'Clear column assignment',
    selectColumnTooltip: 'Select column for assignment',
    unselectColumnTooltip: 'Unselect column',

    dragTargetAreaCaption: 'Target fields',
    getDragTargetOptionalCaption: (field) => `${field} (optional)`,
    getDragTargetRequiredCaption: (field) => `${field} (required)`,
    dragTargetPlaceholder: 'Drag column here',
    getDragTargetAssignTooltip: (columnCode: string) =>
      `Assign column ${columnCode}`,
    dragTargetClearTooltip: 'Clear column assignment',

    columnCardDummyHeader: 'Unassigned field',
    getColumnCardHeader: (code) => `Column ${code}`
  },

  progressStep: {
    stepSubtitle: 'Import',
    uploadMoreButton: 'Upload More',
    finishButton: 'Finish',
    statusError: 'Could not import',
    statusComplete: 'Complete',
    statusPending: 'Importing...',
    processedRowsLabel: 'Processed rows:'
  }
};

export const deDE: ImporterLocale = {
  general: {
    goToPreviousStepTooltip: 'Zum vorherigen Schritt'
  },

  fileStep: {
    initialDragDropPrompt:
      'CSV-Datei auf dieses Feld ziehen, oder klicken um eine Datei auszuwählen',
    activeDragDropPrompt: 'CSV-Datei auf dieses Feld ziehen...',
    nextButton: 'Spalten auswählen',

    getImportError: (message) => `Fehler beim Import: ${message}`,
    getDataFormatError: (message: string) =>
      `Bitte Datenformat überprüfen: ${message}`,
    unsupportedFileFormatError  : 'Dateiformat nicht unterstützt',
    goBackButton: 'Zurück',

    rawFileContentsHeading: 'Originaler Datei-Inhalt',
    previewImportHeading: 'Import-Vorschau',
    dataHasHeadersCheckbox: 'Mit Kopfzeile',
    previewLoadingStatus: 'Vorschau wird geladen...'
  },

  fieldsStep: {
    stepSubtitle: 'Spalten auswählen',
    requiredFieldsError:
      'Bitte weise allen nicht optionalen Spalten einen Wert zu',
    nextButton: 'Importieren',

    dragSourceAreaCaption: 'Zu importierende Spalte',
    getDragSourcePageIndicator: (currentPage: number, pageCount: number) =>
      `Seite ${currentPage} von ${pageCount}`,
    getDragSourceActiveStatus: (columnCode: string) =>
      `Spalte ${columnCode} zuweisen`,
    nextColumnsTooltip: 'Nächste Spalten anzeigen',
    previousColumnsTooltip: 'Vorherige Spalten anzeigen',
    clearAssignmentTooltip: 'Zugewiesene Spalte entfernen',
    selectColumnTooltip: 'Spalte zum Zuweisen auswählen',
    unselectColumnTooltip: 'Spalte abwählen',

    dragTargetAreaCaption: 'Zielfelder',
    getDragTargetOptionalCaption: (field) => `${field} (optional)`,
    getDragTargetRequiredCaption: (field) => `${field} (erforderlich)`,
    dragTargetPlaceholder: 'Spalte hierher ziehen',
    getDragTargetAssignTooltip: (columnCode: string) =>
      `Spalte ${columnCode} zuweisen`,
    dragTargetClearTooltip: 'Zugewiesene Spalte entfernen',

    columnCardDummyHeader: 'Nicht zugewiesenes Feld',
    getColumnCardHeader: (code) => `Spalte ${code}`
  },

  progressStep: {
    stepSubtitle: 'Importieren',
    uploadMoreButton: 'Weitere hochladen',
    finishButton: 'Abschließen',
    statusError: 'Konnte nicht importiert werden',
    statusComplete: 'Fertig',
    statusPending: 'Wird importiert...',
    processedRowsLabel: 'Verarbeitete Zeilen:'
  }
};

export const itIT: ImporterLocale = {
  general: {
    goToPreviousStepTooltip: 'Torna indietro'
  },

  fileStep: {
    initialDragDropPrompt:
      'Trascina qui il file CSV, o clicca per selezionarlo dal PC',
    activeDragDropPrompt: 'Rilascia qui il file CSV...',

    getImportError: (message) => `Errore durante l'importazione: ${message}`,
    getDataFormatError: (message) => `Si prega di controllare il formato dei dati: ${message}`,
    unsupportedFileFormatError  : 'Formato file non supportato',
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

export const ptBR: ImporterLocale = {
  general: {
    goToPreviousStepTooltip: 'Voltar a etapa anterior'
  },

  fileStep: {
    initialDragDropPrompt:
      'Arraste e solte o arquivo CSV aqui ou clique para selecionar na pasta',
    activeDragDropPrompt: 'Arraste e solte o arquivo CSV aqui...',

    getImportError: (message) => `Erro ao importar: ${message}`,
    getDataFormatError: (message) => `Por favor confira a formatação dos dados: ${message}`,
    unsupportedFileFormatError  : 'Formato de arquivo não suportado',
    goBackButton: 'Voltar',
    nextButton: 'Escolher Colunas',

    rawFileContentsHeading: 'Conteúdo Bruto do Arquivo',
    previewImportHeading: 'Visualizar Importação',
    dataHasHeadersCheckbox: 'Os dados têm cabeçalhos',
    previewLoadingStatus: 'Carregando visualização...'
  },

  fieldsStep: {
    stepSubtitle: 'Selecionar Colunas',
    requiredFieldsError: 'Atribua todos os campos obrigatórios',
    nextButton: 'Importar',

    dragSourceAreaCaption: 'Colunas para importar',
    getDragSourcePageIndicator: (currentPage: number, pageCount: number) =>
      `Página ${currentPage} de ${pageCount}`,
    getDragSourceActiveStatus: (columnCode: string) =>
      `Atribuindo coluna ${columnCode}`,
    nextColumnsTooltip: 'Mostrar as próximas colunas',
    previousColumnsTooltip: 'Mostrar colunas anteriores',
    clearAssignmentTooltip: 'Limpar atribuição de coluna',
    selectColumnTooltip: 'Selecione a coluna para atribuição',
    unselectColumnTooltip: 'Desmarcar coluna',

    dragTargetAreaCaption: 'Campos de destino',
    getDragTargetOptionalCaption: (field) => `${field} (opcional)`,
    getDragTargetRequiredCaption: (field) => `${field} (obrigatório)`,
    dragTargetPlaceholder: 'Arraste a coluna aqui',
    getDragTargetAssignTooltip: (columnCode: string) =>
      `Atribuir coluna ${columnCode}`,
    dragTargetClearTooltip: 'Limpar atribuição de coluna',

    columnCardDummyHeader: 'Campo não atribuído',
    getColumnCardHeader: (code) => `Coluna ${code}`
  },

  progressStep: {
    stepSubtitle: 'Importar',
    uploadMoreButton: 'Carregar mais',
    finishButton: 'Finalizar',
    statusError: 'Não foi possível importar',
    statusComplete: 'Completo',
    statusPending: 'Importando...',
    processedRowsLabel: 'Linhas processadas:'
  }
};

export const daDK: ImporterLocale = {
  general: {
    goToPreviousStepTooltip: "Gå til forrige trin",
  },

  fileStep: {
    initialDragDropPrompt:
      "Træk og slip CSV-fil her eller klik for at vælge fra en mappe",
    activeDragDropPrompt: "Slip CSV-fil her...",

    getImportError: (message) => `Import-fejl: ${message}`,
    getDataFormatError: (message) =>
      `Kontrollér venligst data-formatering: ${message}`,
    unsupportedFileFormatError  : 'Filformat understøttes ikke',
    goBackButton: "Gå tilbage",
    nextButton: "Vælg kolonner",

    rawFileContentsHeading: "Rå filindhold",
    previewImportHeading: "Forhåndsvis Import",
    dataHasHeadersCheckbox: "Data sidehoved",
    previewLoadingStatus: "Indlæser forhåndsvisning...",
  },

  fieldsStep: {
    stepSubtitle: "Vælg kolonner",
    requiredFieldsError: "Tildel venligst alle påkrævede felter",
    nextButton: "Importér",

    dragSourceAreaCaption: "Kolonner til import",
    getDragSourcePageIndicator: (currentPage: number, pageCount: number) =>
      `Side ${currentPage} af ${pageCount}`,
    getDragSourceActiveStatus: (columnCode: string) =>
      `Tildeler kolonne ${columnCode}`,
    nextColumnsTooltip: "Vis næste kolonner",
    previousColumnsTooltip: "Vis forrige kolonner",
    clearAssignmentTooltip: "Ryd kolonne-tildeling",
    selectColumnTooltip: "Vælg kolonne til tildeling",
    unselectColumnTooltip: "Fravælg kolonne",

    dragTargetAreaCaption: "Mål-felter",
    getDragTargetOptionalCaption: (field) => `${field} (valgfri)`,
    getDragTargetRequiredCaption: (field) => `${field} (påkrævet)`,
    dragTargetPlaceholder: "Træk kolonne hertil",
    getDragTargetAssignTooltip: (columnCode: string) =>
      `Tildel kolonne ${columnCode}`,
    dragTargetClearTooltip: "Ryd kolonne-tildeling",

    columnCardDummyHeader: "Disponibelt felt",
    getColumnCardHeader: (code) => `Column ${code}`,
  },

  progressStep: {
    stepSubtitle: "Importér",
    uploadMoreButton: "Upload Mere",
    finishButton: "Færdiggør",
    statusError: "Kunne ikke importere",
    statusComplete: "Færdig",
    statusPending: "Importerer...",
    processedRowsLabel: "Processerede rækker:",
  }
};

export const trTR: ImporterLocale = {
  general: {
    goToPreviousStepTooltip: "Bir önceki adıma geri dön",
  },

  fileStep: {
    initialDragDropPrompt:
      "CSV dosyasını sürükleyin veya kutunun içine tıklayıp dosyayı seçin",
    activeDragDropPrompt: "CSV dosyasını buraya bırakın...",

    getImportError: (message) => `Import hatası: ${message}`,
    getDataFormatError: (message) =>
      `Lütfen veri formatını kontrol edin: ${message}`,
    unsupportedFileFormatError  : 'Dosya formatı desteklenmiyor',
    goBackButton: "Geri",
    nextButton: "Kolonları Seç",

    rawFileContentsHeading: "CSV dosyası içeriği",
    previewImportHeading: "Import önizleme",
    dataHasHeadersCheckbox: "Veride başlıklar var",
    previewLoadingStatus: "Önizleme yükleniyor...",
  },

  fieldsStep: {
    stepSubtitle: "Kolonları seçin",
    requiredFieldsError: "Lütfen zorunlu tüm alanları doldurun.",
    nextButton: "Import",

    dragSourceAreaCaption: "Import edilecek kolonlar",
    getDragSourcePageIndicator: (currentPage: number, pageCount: number) =>
      `${pageCount} sayfadan ${currentPage}. sayfadasınız`,
    getDragSourceActiveStatus: (columnCode: string) =>
      `${columnCode}. kolon atanıyor`,
    nextColumnsTooltip: "Sıradaki kolonları göster",
    previousColumnsTooltip: "Önceki kolonları göster",
    clearAssignmentTooltip: "Kolon atamayı temizle",
    selectColumnTooltip: "Atamak için kolon seçiniz",
    unselectColumnTooltip: "Kolonu seçmeyi bırak",

    dragTargetAreaCaption: "Hedef alanlar",
    getDragTargetOptionalCaption: (field) => `${field} (opsiyonel)`,
    getDragTargetRequiredCaption: (field) => `${field} (zorunlu)`,
    dragTargetPlaceholder: "Kolonu buraya sürükle",
    getDragTargetAssignTooltip: (columnCode: string) =>
      `${columnCode}. kolonu ata`,
    dragTargetClearTooltip: "Kolon atamayı temizle",

    columnCardDummyHeader: "Atanmamış alan",
    getColumnCardHeader: (code) => `Kolon ${code}`,
  },

  progressStep: {
    stepSubtitle: "Import",
    uploadMoreButton: "Sonrakileri yükle",
    finishButton: "Bitir",
    statusError: "Import edilemedi",
    statusComplete: "Tamamlandı",
    statusPending: "Import ediliyor...",
    processedRowsLabel: "İşlenen satır sayısı:",
  },
};
