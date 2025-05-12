import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. Import AuthProvider:
import { AuthProvider } from 'react-oidc-context';
// 2. Import your newly exported ChatBoard:
import { ChatBoard } from './App';

// 3. Define your OIDC config only once here:
const oidcConfig = {
  authority:
    'https://us-east-1_bDm4jlqL4.auth.us-east-1.amazoncognito.com',
  client_id: '2fcgrmmovvgt1sfo180bkp2kan',
  redirect_uri: 'https://staging.d1xsb7yotrm5oo.amplifyapp.com',
  post_logout_redirect_uri: 'https://staging.d1xsb7yotrm5oo.amplifyapp.com',
  response_type: 'code',
  scope: 'openid email profile',
  metadata: {
    issuer: 'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com',
    authorization_endpoint: 'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com/oauth2/authorize',
    token_endpoint: 'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com/oauth2/token',
    userinfo_endpoint: 'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com/oauth2/userInfo',
    jwks_uri: 'https://us-east-1bdm4jlql4.auth.us-east-1.amazoncognito.com/.well-known/jwks.json',
    end_session_endpoint: 'https://us-east-1_bDm4jlqL4.auth.us-east-1.amazoncognito.com/logout',
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Wrap ChatBoard directly in the AuthProvider */}  
    <AuthProvider {...oidcConfig}>
      <ChatBoard />
    </AuthProvider>
  </React.StrictMode>
);
