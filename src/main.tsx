import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suprimir erros de WebSocket que são comuns no ambiente de desenvolvimento
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (
    event.reason.message === 'WebSocket closed without opened.' ||
    (typeof event.reason === 'string' && event.reason.includes('WebSocket'))
  )) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
