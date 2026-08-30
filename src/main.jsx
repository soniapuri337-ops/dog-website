/* iOS 12.0 and 12.1 have no IntersectionObserver, and Safari 12 takes the modern
   bundle (it supports ES modules), so the legacy polyfill chunk never reaches it.
   This package no-ops when the native API exists, so importing it unconditionally
   costs modern browsers a couple of KB and nothing else. Must come before React,
   since Framer Motion's whileInView reads the global at module scope. */
import 'intersection-observer';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
