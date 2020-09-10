import React, { useMemo } from 'react';
import { useDrag } from 'react-use-gesture';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import { FieldAssignmentMap } from './parser';
import { DragState } from './ColumnDragState';
import { ColumnDragCard, Column } from './ColumnDragCard';

// @todo de-duplicate definition
export interface Field {
  name: string;
  label: string;
  isOptional: boolean;
}

export type FieldTouchedMap = { [name: string]: boolean | undefined };

const useStyles = makeStyles((theme) => ({
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

export const ColumnDragTargetArea: React.FC<{
  fields: Field[];
  columns: Column[];
  hasHeaders: boolean;
  fieldTouched: FieldTouchedMap;
  fieldAssignments: FieldAssignmentMap;
  dragState: DragState | null;
  eventBinder: (
    // @todo import type from drag state tracker
    column: Column,
    startFieldName?: string
  ) => ReturnType<typeof useDrag>;
  onHover: (fieldName: string, isOn: boolean) => void;
  onUnassign: (column: Column) => void;
}> = ({
  fields,
  columns,
  hasHeaders,
  fieldTouched,
  fieldAssignments,
  dragState,
  eventBinder,
  onHover,
  onUnassign
}) => {
  const styles = useStyles();

  return (
    <div className={styles.targetArea}>
      {fields.map((field) => {
        const assignedColumnIndex = fieldAssignments[field.name];

        return (
          <TargetBox
            key={field.name}
            hasHeaders={hasHeaders}
            field={field}
            touched={fieldTouched[field.name]}
            assignedColumn={
              assignedColumnIndex !== undefined
                ? columns[assignedColumnIndex]
                : null
            }
            dragState={dragState}
            eventBinder={eventBinder}
            onHover={onHover}
            onUnassign={onUnassign}
          />
        );
      })}
    </div>
  );
};
