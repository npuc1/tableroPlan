import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Auth0Provider } from '@auth0/auth0-react';

console.log('Environment Variables Check:');
console.log('Domain:', process.env.REACT_APP_DOMAIN);
console.log('Client ID:', process.env.REACT_APP_CLIENTID);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={process.env.REACT_APP_DOMAIN}
      clientId={process.env.REACT_APP_CLIENTID}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/tablero-de-reporte/`,
        response_type: "code"
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);

reportWebVitals();