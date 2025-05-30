// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';

import { AuthProvider } from 'react-oidc-context';
import { ChatBoard } from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';


// OIDC config for react-oidc-context
const oidcConfig = {
  authority:
    'https://us-east-1_bDm4jlqL4.auth.us-east-1.amazoncognito.com',
  client_id: '2fcgrmmovvgt1sfo180bkp2kan',
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid email profile',
  metadata: {
    issuer:
      'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com',
    authorization_endpoint:
      'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com/oauth2/authorize',
    token_endpoint:
      'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com/oauth2/token',
    userinfo_endpoint:
      'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com/oauth2/userInfo',
    jwks_uri:
      'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com/.well-known/jwks.json',
  },
};

const root = ReactDOM.createRoot(
  document.getElementById('root')
);


root.render(
  <React.StrictMode>      
      <AuthProvider {...oidcConfig}>
        <ChatBoard />
      </AuthProvider>
  </React.StrictMode>
);
