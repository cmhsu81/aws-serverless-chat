// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from 'react-oidc-context';

const oidcConfig = {
  authority: 'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com',
  client_id: '2fcgrmmovvgt1sfo180bkp2kan',
  redirect_uri: 'http://localhost:3000',
  post_logout_redirect_uri: 'http://localhost:3000',
  response_type: 'code',
  scope: 'openid email profile',
  metadata: {
    issuer: 'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com',
    authorization_endpoint: 'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com/oauth2/authorize',
    token_endpoint: 'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com/oauth2/token',
    userinfo_endpoint: 'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com/oauth2/userInfo',
    jwks_uri: 'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com/.well-known/jwks.json',
  },
};


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
