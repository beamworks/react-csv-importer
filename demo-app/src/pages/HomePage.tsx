import React from 'react';
import Typography from '@material-ui/core/Typography';

import { AppLink } from '../components/AppLink';

export const HomePage: React.FC = () => (
  <div>
    <Typography variant="body1" gutterBottom>
      Welcome! This is the home page.
    </Typography>
    <Typography variant="body1">
      Please visit the <AppLink to="/import">importer UI sandbox</AppLink>.
    </Typography>
  </div>
);
