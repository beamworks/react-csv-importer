import { ImporterLocale } from './ImporterLocale';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types -- all exports are ImporterLocale which is already fully typed */
export const ptBR: ImporterLocale = {
  general: {
    goToPreviousStepTooltip: 'Voltar a etapa anterior'
  },

  fileStep: {
    initialDragDropPrompt:
      'Arraste e solte o arquivo CSV aqui ou clique para selecionar na pasta',
    activeDragDropPrompt: 'Arraste e solte o arquivo CSV aqui...',

    getImportError: (message) => `Erro ao importar: ${message}`,
    getDataFormatError: (message) =>
      `Por favor confira a formatação dos dados: ${message}`,
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
