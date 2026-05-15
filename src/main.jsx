import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AppProviders from './app/AppProviders';
import './styles/global.scss';
import 'katex/dist/katex.min.css';

const storedDarkMode = window.localStorage.getItem('lf_dark_mode');
const storedFontSize = window.localStorage.getItem('lf_font_size');

if (storedDarkMode !== null) {
  document.body.dataset.theme = storedDarkMode === 'true' ? 'dark' : 'light';
}

if (storedFontSize) {
  document.body.style.fontSize = `${storedFontSize}px`;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
