import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'

// Storage shim (localStorage for PWA)
function storageError(action, key, error) {
  return new Error(`Failed to ${action} local storage key "${key}"`, { cause: error })
}

window.storage = {
  get: async (key) => {
    try {
      const value = localStorage.getItem(key)
      return value !== null ? { key, value } : null
    } catch (error) {
      throw storageError('read', key, error)
    }
  },
  set: async (key, value) => {
    try {
      localStorage.setItem(key, value)
      return { key, value }
    } catch (error) {
      throw storageError('write', key, error)
    }
  },
  delete: async (key) => {
    try {
      localStorage.removeItem(key)
      return { key, deleted: true }
    } catch (error) {
      throw storageError('delete', key, error)
    }
  },
  list: async (prefix) => {
    try {
      const keys = Object.keys(localStorage).filter(k => !prefix || k.startsWith(prefix));
      return { keys };
    } catch (error) {
      throw storageError('list', prefix || '*', error)
    }
  }
};

// Service Worker registration
let swReg = null;

async function postServiceWorkerMessage(message) {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported by this browser')
  }

  const registration = swReg?.active ? swReg : await navigator.serviceWorker.ready
  if (!registration.active) {
    throw new Error('Service worker is not active')
  }

  registration.active.postMessage(message)
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    swReg = reg;
    void postServiceWorkerMessage({ type: 'WATER_INTERVAL' })
      .catch(error => console.error('Failed to start water reminders:', error))
    reg.addEventListener('updatefound', () => {
      reg.installing?.addEventListener('statechange', e => {
        if (e.target.state === 'activated') {
          void postServiceWorkerMessage({ type: 'WATER_INTERVAL' })
            .catch(error => console.error('Failed to restart water reminders:', error))
        }
      });
    });
  }).catch(error => console.error('Service worker registration failed:', error));
}

window.scheduleNotif = function(id, delayMs, title, body) {
  return postServiceWorkerMessage({ type: 'SCHEDULE', id, delay: delayMs, title, body, tag: `hk-${id}` })
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
