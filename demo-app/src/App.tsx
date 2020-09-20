import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';

import { AppTheme } from './components/AppTheme';
import { AppSnackbarProvider } from './components/AppSnackbar';
import { PageLayout } from './components/PageLayout';
import { HomePage } from './pages/HomePage';
import { ImportPage } from './pages/ImportPage';
import { NotFoundPage } from './pages/NotFoundPage';

// eslint-disable-next-line react/display-name
const AppRoutes: React.FC = React.memo(() => {
  return (
    <Switch>
      <Redirect exact from="/" to="/home" />
      <Route path="/home" component={HomePage} />
      <Route path="/chart-import" component={ImportPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
});

export const App: React.FC = () => {
  return (
    <Router>
      <AppTheme>
        <AppSnackbarProvider>
          <PageLayout main={<AppRoutes />} />
        </AppSnackbarProvider>
      </AppTheme>
    </Router>
  );
};
