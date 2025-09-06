import React from 'react';
import { createRoot } from 'react-dom/client';
import UserDashboard from './components/user/UserDashboard';

// Initialize User Dashboard
const container = document.getElementById('user-dashboard');
if (container) {
    const root = createRoot(container);
    const initialData = window.userData || {
        user: {},
        watchlists: [],
        sectorData: {}
    };
    
    root.render(<UserDashboard initialData={initialData} />);
}