import React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './hooks/useTheme';
import { CustomizationProvider } from './hooks/useCustomization';
import { GoogleOAuthProvider } from '@react-oauth/google';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Cambiado para que Vercel lo exponga de forma segura en el cliente.
const googleClientId = process.env.VERCEL_PUBLIC_GOOGLE_CLIENT_ID;

const root = ReactDOM.createRoot(rootElement);

const AppContent = (
  <ThemeProvider>
    <CustomizationProvider>
      <App />
    </CustomizationProvider>
  </ThemeProvider>
);

root.render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        {AppContent}
      </GoogleOAuthProvider>
    ) : (
      AppContent
    )}
  </React.StrictMode>
);