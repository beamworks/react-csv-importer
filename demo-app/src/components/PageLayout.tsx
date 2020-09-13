import React from 'react';
import { Link } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Avatar from '@material-ui/core/Avatar';

import { AppLink } from './AppLink';

export const PageLayout: React.FC<{ main: React.ReactNode }> = ({ main }) => {
  return (
    <Container component="main" maxWidth="md" disableGutters>
      <Box display="flex" flexDirection="column" minHeight="100%">
        <Box flex="none">
          <AppBar position="sticky">
            <Toolbar>
              <Typography variant="h1">
                <MuiLink
                  underline="hover"
                  color="secondary"
                  component={Link}
                  to="/home"
                >
                  DemoApp
                </MuiLink>
              </Typography>
              <Box flex="auto" pl={2} />
              <Typography variant="subtitle1" color="textPrimary" align="right">
                React CSV Importer Sample
              </Typography>
              <Box flex="none" ml={2}>
                <Avatar
                  variant="circle"
                  style={{ width: '4rem', height: '4rem' }}
                  alt="Sample Account"
                  src="https://placekeanu.com/120/g"
                />
              </Box>
            </Toolbar>
          </AppBar>
        </Box>
        <Box flex="1 1 0" px={2} py={4} bgcolor="background.default">
          {main}
        </Box>
        <Box flex="none" display="flex" p={2} bgcolor="secondary.light">
          <Box flex="auto" color="secondary.contrastText">
            <Typography variant="body2" color="inherit">
              Demo for{' '}
              <MuiLink href="https://www.npmjs.com/package/react-csv-importer">
                React CSV Importer
              </MuiLink>
            </Typography>
          </Box>
          <Box flex="none" ml={2}>
            <MuiLink
              underline="always"
              href="https://www.npmjs.com/package/react-csv-importer"
            >
              npm
            </MuiLink>
          </Box>
          <Box flex="none" ml={2}>
            <MuiLink
              underline="always"
              href="https://github.com/beamworks/react-csv-importer"
            >
              GitHub
            </MuiLink>
          </Box>
          <Box flex="none" ml={2}>
            <AppLink to="/home">Demo Home</AppLink>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};
