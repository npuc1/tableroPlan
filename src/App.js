import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Homepage from './components/Homepage';
import MainApp from './components/MainApp';

function App() {
  const { isAuthenticated, isLoading, error, user } = useAuth0();

  console.log('Auth Status:', {
    isAuthenticated,
    isLoading,
    error: error ? error.message : null,
    user
  });

  if (error) {
    return <div>Authentication Error: {error.message}</div>;
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <MainApp /> : <Homepage />;
}

export default App;