import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LandingPage from './components/pages/LandingPage';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import ErrorPage from './components/pages/ErrorPage';

// Dashboards
import UserDashboard from './components/user/UserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [watchlists, setWatchlists] = useState([]);
    const [sectorData, setSectorData] = useState({});

    useEffect(() => {
        // Check for existing session
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setWatchlists(data.watchlists || []);
                setSectorData(data.sectorData || {});
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (userData) => {
        setUser(userData);
        fetchUserData(); // Refresh all data after login
    };

    const handleLogout = () => {
        setUser(null);
        setWatchlists([]);
        setSectorData({});
    };

    // Protected Route Component
    const ProtectedRoute = ({ children, adminOnly = false }) => {
        if (loading) {
            return (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            );
        }

        if (!user) {
            return <Navigate to="/login" replace />;
        }

        if (adminOnly && !user.is_admin) {
            return <ErrorPage code="403" title="Access Forbidden" message="You don't have permission to access this page." />;
        }

        return children;
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Root Route - Redirect based on auth */}
                <Route 
                    path="/" 
                    element={
                        user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
                    } 
                />
                <Route 
                    path="/login" 
                    element={
                        user ? <Navigate to="/dashboard" replace /> : (
                            <Layout user={user} onLogout={handleLogout}>
                                <LoginPage onLogin={handleLogin} />
                            </Layout>
                        )
                    } 
                />
                <Route 
                    path="/signup" 
                    element={
                        user ? <Navigate to="/dashboard" replace /> : (
                            <Layout user={user} onLogout={handleLogout}>
                                <SignupPage onLogin={handleLogin} />
                            </Layout>
                        )
                    } 
                />

                {/* Admin Routes */}
                <Route 
                    path="/admin/login" 
                    element={
                        <Layout user={user} onLogout={handleLogout}>
                            <LoginPage onLogin={handleLogin} />
                        </Layout>
                    } 
                />
                <Route 
                    path="/admin/dashboard" 
                    element={
                        <AdminDashboard 
                            initialData={window.adminData || {}}
                        />
                    } 
                />

                {/* Protected User Routes */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <UserDashboard 
                                initialData={{
                                    user: user,
                                    watchlists: watchlists,
                                    sectorData: sectorData
                                }}
                            />
                        </ProtectedRoute>
                    } 
                />

                {/* Protected Admin Routes */}
                <Route 
                    path="/admin/dashboard" 
                    element={
                        <ProtectedRoute adminOnly={true}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/admin/login" 
                    element={
                        user?.is_admin ? <Navigate to="/admin/dashboard" replace /> : (
                            <Layout user={user} onLogout={handleLogout}>
                                <LoginPage onLogin={handleLogin} />
                            </Layout>
                        )
                    } 
                />

                {/* 404 Route */}
                <Route 
                    path="*" 
                    element={
                        <Layout user={user} onLogout={handleLogout}>
                            <ErrorPage />
                        </Layout>
                    } 
                />
            </Routes>
        </Router>
    );
};

export default App;