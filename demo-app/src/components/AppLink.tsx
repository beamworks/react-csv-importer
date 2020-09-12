import React from 'react';
import { Link } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';

export const AppLink: React.FC<{ to: string }> = (props) => {
  return <MuiLink component={Link} underline="always" {...props} />;
};
