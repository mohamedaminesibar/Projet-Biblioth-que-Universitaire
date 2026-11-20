// Safeguard for extensions and test runners attempting window.fetch = ...
try {
  const _orig = typeof window.fetch === 'function' ? window.fetch.bind(window) : window.fetch;
  let _current = _orig;
  const desc = {
    get() {
      return _current;
    },
    set(val: typeof fetch) {
      _current = val;
    },
    configurable: true,
    enumerable: true,
  };
  try {
    Object.defineProperty(window, 'fetch', desc);
  } catch {}
  if (typeof Window !== 'undefined' && Window.prototype) {
    try {
      Object.defineProperty(Window.prototype, 'fetch', desc);
    } catch {}
  }
} catch {}

import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
