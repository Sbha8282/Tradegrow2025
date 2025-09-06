import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminDashboard from './components/admin/AdminDashboard';

// Initialize Admin Dashboard
const container = document.getElementById('admin-dashboard');
if (container) {
    const root = createRoot(container);
    const initialData = window.adminData || {
        stats: {},
        screenings: [],
        user: {}
    };
    
    root.render(<AdminDashboard initialData={initialData} />);
}