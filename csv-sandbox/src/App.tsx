import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';

import { AppTheme } from './components/AppTheme';
import { PageLayout } from './components/PageLayout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppRoutes: React.FC = React.memo(() => {
  return (
    <Switch>
      <Redirect exact from="/" to="/home" />
      <Route path="/home" component={HomePage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
});

export const App: React.FC = () => {
  return (
    <Router>
      <AppTheme>
        <PageLayout main={<AppRoutes />} />
      </AppTheme>
    </Router>
  );
};
