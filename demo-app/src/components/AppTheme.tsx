import React from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

const appTheme = createMuiTheme();

export const AppTheme: React.FC = ({ children }) => {
  return (
    <MuiThemeProvider theme={appTheme}>
      <CssBaseline />

      {children}
    </MuiThemeProvider>
  );
};
