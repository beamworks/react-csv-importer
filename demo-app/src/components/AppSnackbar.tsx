import React, { useCallback } from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

export const AppSnackbarProvider: React.FC = ({ children }) => {
  return <SnackbarProvider maxSnack={8}>{children}</SnackbarProvider>;
};

// Notistack snack with close action
export function useAppSnackbar(): (message: React.ReactNode) => void {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const openHandler = useCallback(
    (message: React.ReactNode) => {
      function action(messageKey: string) {
        return (
          <IconButton
            aria-label="Close"
            color="inherit"
            onClick={() => {
              closeSnackbar(messageKey);
            }}
          >
            <CloseIcon />
          </IconButton>
        );
      }

      enqueueSnackbar(message, { action });
    },
    [enqueueSnackbar, closeSnackbar]
  );

  return openHandler;
}
