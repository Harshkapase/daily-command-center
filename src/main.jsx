import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

// Storage shim (localStorage for PWA)
window.storage = {
  get: async (key) => {
    try { const v = localStorage.getItem(key); return v !== null ? { key, value: v } : null; } catch(e) { return null; }
  },
  set: async (key, value) => {
    try { localStorage.setItem(key, value); return { key, value }; } catch(e) { return null; }
  },
  delete: async (key) => {
    try { localStorage.removeItem(key); return { key, deleted: true }; } catch(e) { return null; }
  },
  list: async (prefix) => {
    try {
      const keys = Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix));
      return { keys };
    } catch(e) { return { keys: [] }; }
  }
};

// Service Worker registration
let swReg = null;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    swReg = reg;
    if (reg.active) reg.active.postMessage({ type: 'WATER_INTERVAL' });
    reg.addEventListener('updatefound', () => {
      reg.installing?.addEventListener('statechange', e => {
        if (e.target.state === 'activated') reg.active.postMessage({ type: 'WATER_INTERVAL' });
      });
    });
  }).catch(e => console.warn('SW reg failed:', e));
}

window.scheduleNotif = function(id, delayMs, title, body) {
  if (swReg?.active) {
    swReg.active.postMessage({ type: 'SCHEDULE', id, delay: delayMs, title, body, tag: `hk-${id}` });
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
