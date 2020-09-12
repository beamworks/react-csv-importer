import React from 'react';

import { AppLink } from '../components/AppLink';

export const HomePage: React.FC = () => (
  <div>
    <p>Welcome! This is the home page.</p>
    <p>
      Please visit the <AppLink to="/import">importer UI sandbox</AppLink>.
    </p>
  </div>
);
