import React, { useState, useMemo } from 'react';
import { useDrag } from 'react-use-gesture';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ReplayIcon from '@material-ui/icons/Replay';
import CloseIcon from '@material-ui/icons/Close';

import { PreviewInfo, FieldAssignmentMap } from './parser';
import { ImporterFrame } from './ImporterFrame';
import { useColumnDragState, DragState } from './ColumnDragState';
import { ColumnDragCard, Column } from './ColumnDragCard';

export interface Field {
  name: string;
  label: string;
  isOptional: boolean;
}

const SOURCES_PAGE_SIZE = 5; // fraction of 10 for easier counting

const useStyles = makeStyles((theme) => ({
  sourceArea: {
    display: 'flex',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  sourceAreaControl: {
    flex: 'none',
    display: 'flex',
    alignItems: 'center'
  },
  sourceAreaPage: {
    flex: '1 1 0',
    display: 'flex',
    paddingLeft: theme.spacing(1) // match interior box spacing
  },
  sourceAreaPageFiller: {
    flex: '1 1 0',
    marginRight: theme.spacing(1)
  },
  sourceBox: {
    position: 'relative', // for action
    flex: '1 1 0',
    marginRight: theme.spacing(1),
    width: 0 // prevent internal sizing from affecting placement
  },
  sourceBoxAction: {
    position: 'absolute',
    top: theme.spacing(0.5), // matches up with column card header sizing
    right: theme.spacing(0.5),
    zIndex: 1 // right above content
  },
  targetArea: {
    display: 'flex',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  targetBox: {
    flexShrink: 1,
    flexGrow: 0,
    flexBasis: '25%',
    width: 0, // avoid interference from internal width
    paddingRight: theme.spacing(2),
    paddingTop: theme.spacing(2)
  },
  targetBoxLabel: {
    marginBottom: theme.spacing(0.5),
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
    wordBreak: 'break-word',

    '& > b': {
      marginLeft: theme.spacing(0.5),
      color: theme.palette.error.dark
    }
  },
  targetBoxValue: {
    position: 'relative' // for action
  },
  targetBoxValueAction: {
    position: 'absolute',
    top: theme.spacing(0.5), // matches up with column card header sizing
    right: theme.spacing(0.5),
    zIndex: 1 // right above content
  },
  targetBoxPlaceholderHelp: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '98%', // nudge up a bit
    zIndex: 1, // right above content
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.palette.text.secondary
  }
}));

const SourceBox: React.FC<{
  hasHeaders: boolean;
  column: Column;
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  eventBinder: (column: Column) => ReturnType<typeof useDrag>;
  onUnassign: (column: Column) => void;
}> = ({
  hasHeaders,
  column,
  fieldAssignments,
  dragState,
  eventBinder,
  onUnassign
}) => {
  const styles = useStyles();

  const isShadow = dragState ? column === dragState.column : false;

  const isAssigned = useMemo(
    () =>
      Object.keys(fieldAssignments).some(
        (fieldName) => fieldAssignments[fieldName] === column.index
      ),
    [fieldAssignments, column]
  );

  const eventHandlers = useMemo(() => eventBinder(column), [
    eventBinder,
    column
  ]);

  return (
    <div className={styles.sourceBox}>
      {isAssigned ? (
        <div className={styles.sourceBoxAction}>
          <IconButton size="small" onClick={() => onUnassign(column)}>
            <ReplayIcon fontSize="inherit" />
          </IconButton>
        </div>
      ) : undefined}

      <div {...(isAssigned ? {} : eventHandlers)}>
        <ColumnDragCard
          hasHeaders={hasHeaders}
          column={column}
          isShadow={isShadow || isAssigned}
          isDraggable={!dragState && !isShadow && !isAssigned}
        />
      </div>
    </div>
  );
};

// @todo current page indicator (dots)
const SourceArea: React.FC<{
  hasHeaders: boolean;
  columns: Column[];
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  eventBinder: (column: Column) => ReturnType<typeof useDrag>;
  onUnassign: (column: Column) => void;
}> = ({
  hasHeaders,
  columns,
  fieldAssignments,
  dragState,
  eventBinder,
  onUnassign
}) => {
  const styles = useStyles();

  const [page, setPage] = useState<number>(0);
  const pageCount = Math.ceil(columns.length / SOURCES_PAGE_SIZE);

  const start = page * SOURCES_PAGE_SIZE;
  const pageContents = columns
    .slice(start, start + SOURCES_PAGE_SIZE)
    .map((column, columnIndex) => (
      <SourceBox
        key={columnIndex}
        hasHeaders={hasHeaders}
        column={column}
        fieldAssignments={fieldAssignments}
        dragState={dragState}
        eventBinder={eventBinder}
        onUnassign={onUnassign}
      />
    ));

  while (pageContents.length < SOURCES_PAGE_SIZE) {
    pageContents.push(
      <div key={pageContents.length} className={styles.sourceAreaPageFiller} />
    );
  }

  return (
    <div className={styles.sourceArea}>
      <div className={styles.sourceAreaControl}>
        <IconButton
          disabled={page === 0}
          onClick={() => {
            setPage((prev) => Math.max(0, prev - 1));
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </div>
      <div className={styles.sourceAreaPage}>{pageContents}</div>
      <div className={styles.sourceAreaControl}>
        <IconButton
          disabled={page === pageCount - 1}
          onClick={() => {
            setPage((prev) => Math.min(pageCount - 1, prev + 1));
          }}
        >
          <ArrowForwardIcon />
        </IconButton>
      </div>
    </div>
  );
};

const TargetBox: React.FC<{
  hasHeaders: boolean;
  field: Field;
  touched?: boolean;
  assignedColumn: Column | null;
  dragState: DragState | null;
  eventBinder: (
    column: Column,
    startFieldName?: string
  ) => ReturnType<typeof useDrag>;
  onHover: (fieldName: string, isOn: boolean) => void;
  onUnassign: (column: Column) => void;
}> = ({
  hasHeaders,
  field,
  touched,
  assignedColumn,
  dragState,
  eventBinder,
  onHover,
  onUnassign
}) => {
  const styles = useStyles();

  const mouseHoverHandlers = dragState
    ? {
        onMouseEnter: () => onHover(field.name, true),
        onMouseLeave: () => onHover(field.name, false)
      }
    : {};

  const sourceColumn =
    dragState && dragState.dropFieldName === field.name
      ? dragState.column
      : null;

  // see if currently assigned column is being dragged again
  const isReDragged = dragState ? dragState.column === assignedColumn : false;

  const dragHandlers = useMemo(
    () =>
      assignedColumn && !isReDragged
        ? eventBinder(assignedColumn, field.name)
        : {},
    [eventBinder, assignedColumn, isReDragged, field.name]
  );

  const valueContents = useMemo(() => {
    if (sourceColumn) {
      return (
        <ColumnDragCard
          hasHeaders={hasHeaders}
          rowCount={3}
          column={sourceColumn}
          isDropIndicator
        />
      );
    }

    if (assignedColumn) {
      return (
        <ColumnDragCard
          hasHeaders={hasHeaders}
          rowCount={3}
          column={assignedColumn}
          isShadow={isReDragged}
          isDraggable={!isReDragged}
        />
      );
    }

    const hasError = touched && !field.isOptional;
    return (
      <ColumnDragCard
        hasHeaders={hasHeaders}
        rowCount={3}
        hasError={hasError}
      />
    );
  }, [field, hasHeaders, touched, assignedColumn, sourceColumn, isReDragged]);

  // @todo mouse cursor changes to reflect draggable state
  return (
    <div className={styles.targetBox} {...mouseHoverHandlers}>
      <div className={styles.targetBoxLabel}>
        {field.label}
        {field.isOptional ? null : <b>*</b>}
      </div>

      <div className={styles.targetBoxValue}>
        {!sourceColumn && assignedColumn && (
          <div className={styles.targetBoxValueAction}>
            <IconButton size="small" onClick={() => onUnassign(assignedColumn)}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </div>
        )}

        {!sourceColumn && !assignedColumn && (
          <div className={styles.targetBoxPlaceholderHelp}>
            Drag column here
          </div>
        )}

        <div {...dragHandlers}>{valueContents}</div>
      </div>
    </div>
  );
};

export const ColumnPicker: React.FC<{
  fields: Field[];
  preview: PreviewInfo;
  onAccept: (fieldAssignments: FieldAssignmentMap) => void;
  onCancel: () => void;
}> = ({ fields, preview, onAccept, onCancel }) => {
  const styles = useStyles();

  const columns = useMemo<Column[]>(() => {
    return [...new Array(preview.firstRows[0].length)].map((empty, index) => {
      return {
        index,
        values: preview.firstRows.map((row) => row[index] || '')
      };
    });
  }, [preview]);

  // track which fields need to show validation warning
  const [fieldTouched, setFieldTouched] = useState<{
    [name: string]: boolean | undefined;
  }>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    fieldAssignments,
    dragObjectPortal,
    dragState,
    dragEventBinder,
    dragHoverHandler,
    unassignHandler
  } = useColumnDragState(fields, preview.hasHeaders, (fieldName) => {
    setFieldTouched((prev) => {
      if (prev[fieldName]) {
        return prev;
      }

      const copy = { ...prev };
      copy[fieldName] = true;
      return copy;
    });
  });

  return (
    <ImporterFrame
      fileName={preview.file.name}
      subtitle="Select Columns"
      error={validationError}
      onCancel={onCancel}
      onNext={() => {
        // mark all fields as touched
        const fullTouchedMap: typeof fieldTouched = {};
        fields.some((field) => {
          fullTouchedMap[field.name] = true;
        });
        setFieldTouched(fullTouchedMap);

        // submit if validation succeeds
        const hasUnassignedRequired = fields.some(
          (field) =>
            !field.isOptional && fieldAssignments[field.name] === undefined
        );

        if (!hasUnassignedRequired) {
          onAccept({ ...fieldAssignments });
        } else {
          setValidationError('Please assign all required fields');
        }
      }}
    >
      <SourceArea
        hasHeaders={preview.hasHeaders}
        columns={columns}
        fieldAssignments={fieldAssignments}
        dragState={dragState}
        eventBinder={dragEventBinder}
        onUnassign={unassignHandler}
      />

      <Divider />

      <div className={styles.targetArea}>
        {dragObjectPortal}

        {fields.map((field) => {
          const assignedColumnIndex = fieldAssignments[field.name];

          return (
            <TargetBox
              key={field.name}
              hasHeaders={preview.hasHeaders}
              field={field}
              touched={fieldTouched[field.name]}
              assignedColumn={
                assignedColumnIndex !== undefined
                  ? columns[assignedColumnIndex]
                  : null
              }
              dragState={dragState}
              eventBinder={dragEventBinder}
              onHover={dragHoverHandler}
              onUnassign={unassignHandler}
            />
          );
        })}
      </div>
    </ImporterFrame>
  );
};
