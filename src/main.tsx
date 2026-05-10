import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { App } from './app/App';
import { AppProviders } from './app/AppProviders';
import './styles/global.css';

void registerSW({ immediate: true });

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing #root element');
}

createRoot(rootEl).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>
);

