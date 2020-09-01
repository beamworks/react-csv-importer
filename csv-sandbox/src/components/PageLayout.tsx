import React from 'react';
import { Link } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import { AppLink } from './AppLink';

export const PageLayout: React.FC<{ main: React.ReactNode }> = ({ main }) => {
  return (
    <Box display="flex" minHeight="100%">
      <Container component="main" maxWidth="md">
        <Box display="flex" flexDirection="column" minHeight="100%">
          <Box flex="none">
            <AppBar position="sticky">
              <Toolbar>
                <Typography
                  variant="h6"
                  color="inherit"
                  component={Link}
                  to="/home"
                >
                  CSV Sandbox App
                </Typography>
              </Toolbar>
            </AppBar>
          </Box>
          <Box flex="1 1 0" px={2} py={4}>
            {main}
          </Box>
          <Box flex="none" display="flex" p={2} bgcolor="divider">
            <Box flex="auto">
              <Typography variant="body2" color="secondary">
                Example CSV importer application
              </Typography>
            </Box>
            <Box flex="none">
              <AppLink to="/home">Home</AppLink>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
