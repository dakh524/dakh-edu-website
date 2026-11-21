import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Auto-recover from stale chunks / new deployments
window.addEventListener('vite:preloadError', (event) => {
  console.warn('Vite preload error (new deployment detected), refreshing window...', event);
  window.location.reload();
});

window.addEventListener('error', (event) => {
  if (event?.message && event.message.includes('Failed to load module script')) {
    console.warn('Module script MIME error detected, auto-refreshing page...');
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
