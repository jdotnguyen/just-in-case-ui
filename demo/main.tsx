import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/styles/tokens.css';
import { App } from './App';
import './demo.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
