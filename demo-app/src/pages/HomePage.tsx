import React from 'react';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import { AppLink } from '../components/AppLink';

export const HomePage: React.FC = () => (
  <Box pt={4} px={2}>
    <Typography variant="h2" align="center" color="secondary" gutterBottom>
      Welcome to the demo app!
    </Typography>
    <Paper>
      <Box p={2}>
        <Typography variant="body1">
          <AppLink to="/chart-import">Basic import demo</AppLink>
        </Typography>
      </Box>
    </Paper>
  </Box>
);
