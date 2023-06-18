import React from 'react';
import { Routes as Router, Route } from 'react-router-dom';
import { Box } from '@mui/material';

import Loading from 'src/components/Loading';
import { CRouteList } from 'src/constants';

const Routes = () => {
  return (
    <Router>
      {CRouteList.map((route) => {
        const Page = route.component;
        const Layout = route.layout ? route.layout : React.Fragment;

        return (
          <Route
            key={route.path}
            path={route.path}
            element={
              <Layout>
                <React.Suspense
                  fallback={
                    <Box flex={1}>
                      <Loading />
                    </Box>
                  }
                >
                  <Page />
                </React.Suspense>
              </Layout>
            }
          />
        );
      })}
    </Router>
  );
};

export default Routes;
