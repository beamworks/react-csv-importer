import { ImporterLocale } from './ImporterLocale';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types -- all exports are ImporterLocale which is already fully typed */
export const trTR: ImporterLocale = {
  general: {
    goToPreviousStepTooltip: 'Bir önceki adıma geri dön'
  },

  fileStep: {
    initialDragDropPrompt:
      'CSV dosyasını sürükleyin veya kutunun içine tıklayıp dosyayı seçin',
    activeDragDropPrompt: 'CSV dosyasını buraya bırakın...',

    getImportError: (message) => `Import hatası: ${message}`,
    getDataFormatError: (message) =>
      `Lütfen veri formatını kontrol edin: ${message}`,
    goBackButton: 'Geri',
    nextButton: 'Kolonları Seç',

    rawFileContentsHeading: 'CSV dosyası içeriği',
    previewImportHeading: 'Import önizleme',
    dataHasHeadersCheckbox: 'Veride başlıklar var',
    previewLoadingStatus: 'Önizleme yükleniyor...'
  },

  fieldsStep: {
    stepSubtitle: 'Kolonları seçin',
    requiredFieldsError: 'Lütfen zorunlu tüm alanları doldurun.',
    nextButton: 'Import',

    dragSourceAreaCaption: 'Import edilecek kolonlar',
    getDragSourcePageIndicator: (currentPage: number, pageCount: number) =>
      `${pageCount} sayfadan ${currentPage}. sayfadasınız`,
    getDragSourceActiveStatus: (columnCode: string) =>
      `${columnCode}. kolon atanıyor`,
    nextColumnsTooltip: 'Sıradaki kolonları göster',
    previousColumnsTooltip: 'Önceki kolonları göster',
    clearAssignmentTooltip: 'Kolon atamayı temizle',
    selectColumnTooltip: 'Atamak için kolon seçiniz',
    unselectColumnTooltip: 'Kolonu seçmeyi bırak',

    dragTargetAreaCaption: 'Hedef alanlar',
    getDragTargetOptionalCaption: (field) => `${field} (opsiyonel)`,
    getDragTargetRequiredCaption: (field) => `${field} (zorunlu)`,
    dragTargetPlaceholder: 'Kolonu buraya sürükle',
    getDragTargetAssignTooltip: (columnCode: string) =>
      `${columnCode}. kolonu ata`,
    dragTargetClearTooltip: 'Kolon atamayı temizle',

    columnCardDummyHeader: 'Atanmamış alan',
    getColumnCardHeader: (code) => `Kolon ${code}`
  },

  progressStep: {
    stepSubtitle: 'Import',
    uploadMoreButton: 'Sonrakileri yükle',
    finishButton: 'Bitir',
    statusError: 'Import edilemedi',
    statusComplete: 'Tamamlandı',
    statusPending: 'Import ediliyor...',
    processedRowsLabel: 'İşlenen satır sayısı:'
  }
};
