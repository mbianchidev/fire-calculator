import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Remove no-transitions class after React renders to enable smooth theme transitions
// Using DOMContentLoaded for faster initial render, then requestAnimationFrame for safety
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    document.documentElement.classList.remove('no-transitions');
  });
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
