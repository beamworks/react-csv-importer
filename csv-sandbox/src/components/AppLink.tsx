import React from 'react';
import { Link } from 'react-router-dom';
import MaterialLink from '@material-ui/core/Link';

export const AppLink: React.FC<{ to: string }> = (props) => {
  return <MaterialLink component={Link} underline="always" {...props} />;
};
