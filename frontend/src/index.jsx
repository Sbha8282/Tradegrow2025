import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Add global styles for Bootstrap and Font Awesome
if (!document.querySelector('link[href*="bootstrap"]')) {
    const bootstrapLink = document.createElement('link');
    bootstrapLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css';
    bootstrapLink.rel = 'stylesheet';
    document.head.appendChild(bootstrapLink);
}

if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    fontAwesomeLink.rel = 'stylesheet';
    document.head.appendChild(fontAwesomeLink);
}

// Initialize the React App
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    console.error('Root container not found. Make sure you have a div with id="root" in your HTML.');
}