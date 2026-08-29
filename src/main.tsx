import React from 'react';
import ReactDOM from 'react-dom/client';

import App from '@/App';

import '@/locales/i18n';
import './theme/index.css';
import 'simplebar-react/dist/simplebar.min.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
