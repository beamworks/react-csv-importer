import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  errorWithButton: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.shape.borderRadius,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    background: theme.palette.error.main,
    fontSize: theme.typography.fontSize,
    color: theme.palette.error.contrastText,

    '& > span': {
      flex: '1 1 0',
      marginRight: theme.spacing(2),
      wordBreak: 'break-word'
    },

    '& > button': {
      flex: 'none'
    }
  }
}));

export const FormatErrorMessage: React.FC<{
  onCancelClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  // eslint-disable-next-line react/display-name
}> = React.memo(({ onCancelClick, children }) => {
  const styles = useStyles();

  return (
    <div className={styles.errorWithButton}>
      <span>{children}</span>
      <Button size="small" variant="contained" onClick={onCancelClick}>
        Go Back
      </Button>
    </div>
  );
});
