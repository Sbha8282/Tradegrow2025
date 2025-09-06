import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import UserManagement from './UserManagement';
import StockScreening from './StockScreening';

const AdminDashboard = ({ initialData }) => {
    const [activeTab, setActiveTab] = useState('overview');
    
    // Initialize with server-provided data or props
    const adminData = window.adminData || initialData || {};
    const [stats, setStats] = useState(adminData.stats || {});
    const [screenings, setScreenings] = useState(adminData.screenings || []);
    const [subscriptionRequests, setSubscriptionRequests] = useState(adminData.subscription_requests || []);
    const [loading, setLoading] = useState(false);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // Prepare data for charts
    const subscriptionData = [
        { name: 'Free', value: stats.free_users, color: '#6c757d' },
        { name: 'Medium', value: stats.medium_users, color: '#17a2b8' },
        { name: 'Pro', value: stats.pro_users, color: '#28a745' },
    ];

    const userGrowthData = [
        { month: 'Jan', users: Math.floor(stats.total_users * 0.6) },
        { month: 'Feb', users: Math.floor(stats.total_users * 0.7) },
        { month: 'Mar', users: Math.floor(stats.total_users * 0.8) },
        { month: 'Apr', users: Math.floor(stats.total_users * 0.9) },
        { month: 'May', users: stats.total_users },
    ];

    const refreshData = async () => {
        setLoading(true);
        try {
            const response = await fetch('/admin/api/dashboard-data');
            const data = await response.json();
            if (data.success) {
                setStats(data.data.stats);
                setScreenings(data.data.screenings);
            }
        } catch (error) {
            console.error('Failed to refresh data:', error);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        try {
            await fetch('/admin/logout', { method: 'GET' });
            // Redirect to admin login page
            window.location.href = '/admin/login';
        } catch (error) {
            console.error('Logout failed:', error);
            // Fallback: redirect anyway
            window.location.href = '/admin/login';
        }
    };

    const handleSubscriptionRequest = async (requestId, action) => {
        try {
            const response = await fetch(`/admin/subscription-requests/${requestId}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert(`✅ ${data.message}`);
                // Remove the processed request from the list
                setSubscriptionRequests(prev => 
                    prev.filter(req => req.id !== requestId)
                );
                // Refresh stats to reflect any tier changes
                refreshData();
            } else {
                alert(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Failed to process request:', error);
            alert('❌ Failed to process request. Please try again.');
        }
    };

    useEffect(() => {
        // Refresh data every 30 seconds
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);

    const StatCard = ({ title, value, icon, color, trend }) => (
        <div className="col-md-3 mb-4">
            <div className="card h-100">
                <div className="card-body">
                    <div className="d-flex align-items-center">
                        <div className={`me-3 p-3 rounded-circle bg-${color} text-white`}>
                            <i className={`fas ${icon} fa-lg`}></i>
                        </div>
                        <div>
                            <h6 className="card-title text-muted mb-1">{title}</h6>
                            <h3 className="mb-0">{value}</h3>
                            {trend && (
                                <small className="text-success">
                                    <i className="fas fa-arrow-up"></i> {trend}
                                </small>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="container-fluid mt-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-1">Admin Dashboard</h2>
                            <p className="text-muted">Welcome back, Admin</p>
                        </div>
                        <div className="d-flex gap-2">
                            <button 
                                className="btn btn-outline-primary" 
                                onClick={refreshData}
                                disabled={loading}
                            >
                                <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''} me-2`}></i>
                                Refresh Data
                            </button>
                            <button 
                                className="btn btn-outline-danger" 
                                onClick={handleLogout}
                            >
                                <i className="fas fa-sign-out-alt me-2"></i>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <ul className="nav nav-tabs mb-4" role="tablist">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <i className="fas fa-chart-line me-2"></i>Overview
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <i className="fas fa-users me-2"></i>User Management
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'requests' ? 'active' : ''} position-relative`}
                        onClick={() => setActiveTab('requests')}
                    >
                        <i className="fas fa-crown me-2"></i>Subscription Requests
                        {subscriptionRequests.length > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {subscriptionRequests.length}
                            </span>
                        )}
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'screening' ? 'active' : ''}`}
                        onClick={() => setActiveTab('screening')}
                    >
                        <i className="fas fa-search me-2"></i>Stock Screening
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div>
                    {/* Stats Cards */}
                    <div className="row">
                        <StatCard 
                            title="Total Users" 
                            value={stats.total_users} 
                            icon="fa-users" 
                            color="primary" 
                            trend="+12%" 
                        />
                        <StatCard 
                            title="Pro Users" 
                            value={stats.pro_users} 
                            icon="fa-star" 
                            color="success" 
                            trend="+8%" 
                        />
                        <StatCard 
                            title="Medium Users" 
                            value={stats.medium_users} 
                            icon="fa-gem" 
                            color="info" 
                            trend="+5%" 
                        />
                        <StatCard 
                            title="Screenings" 
                            value={stats.total_screenings} 
                            icon="fa-chart-bar" 
                            color="warning" 
                            trend="+3%" 
                        />
                    </div>

                    {/* Charts */}
                    <div className="row">
                        {/* User Growth Chart */}
                        <div className="col-lg-8 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">User Growth</h5>
                                </div>
                                <div className="card-body">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={userGrowthData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line 
                                                type="monotone" 
                                                dataKey="users" 
                                                stroke="#0d6efd" 
                                                strokeWidth={3} 
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Distribution */}
                        <div className="col-lg-4 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Subscription Distribution</h5>
                                </div>
                                <div className="card-body">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={subscriptionData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                dataKey="value"
                                                label={(entry) => `${entry.name}: ${entry.value}`}
                                            >
                                                {subscriptionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Screenings */}
                    <div className="row">
                        <div className="col-12">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <h5 className="card-title mb-0">Recent Stock Screenings</h5>
                                    <button 
                                        className="btn btn-sm btn-primary"
                                        onClick={() => setActiveTab('screening')}
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Results Found</th>
                                                    <th>Created</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {screenings.map(screening => (
                                                    <tr key={screening.id}>
                                                        <td>{screening.name}</td>
                                                        <td>
                                                            <span className="badge bg-primary">
                                                                {screening.results_count} stocks
                                                            </span>
                                                        </td>
                                                        <td>{new Date(screening.created_at).toLocaleDateString()}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-primary">
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscription Requests Tab */}
            {activeTab === 'requests' && (
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <i className="fas fa-crown me-2"></i>
                                    Pending Subscription Requests ({subscriptionRequests.length})
                                </h5>
                            </div>
                            <div className="card-body">
                                {subscriptionRequests.length === 0 ? (
                                    <div className="text-center py-4">
                                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                                        <h5 className="text-muted">No pending requests</h5>
                                        <p className="text-muted">All subscription requests have been processed.</p>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>User</th>
                                                    <th>Email</th>
                                                    <th>Current Plan</th>
                                                    <th>Requested Plan</th>
                                                    <th>Request Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {subscriptionRequests.map(request => (
                                                    <tr key={request.id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className="avatar-sm bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center">
                                                                    {request.user_name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="fw-medium">{request.user_name}</span>
                                                            </div>
                                                        </td>
                                                        <td>{request.user_email}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                request.current_tier === 'free' ? 'bg-secondary' :
                                                                request.current_tier === 'medium' ? 'bg-primary' : 'bg-warning'
                                                            }`}>
                                                                {request.current_tier.charAt(0).toUpperCase() + request.current_tier.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`badge ${
                                                                request.requested_tier === 'medium' ? 'bg-primary' : 'bg-warning'
                                                            }`}>
                                                                {request.requested_tier.charAt(0).toUpperCase() + request.requested_tier.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td>{request.created_at}</td>
                                                        <td>
                                                            <div className="btn-group" role="group">
                                                                <button
                                                                    className="btn btn-sm btn-success"
                                                                    onClick={() => handleSubscriptionRequest(request.id, 'approve')}
                                                                >
                                                                    <i className="fas fa-check me-1"></i>Approve
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-danger"
                                                                    onClick={() => handleSubscriptionRequest(request.id, 'reject')}
                                                                >
                                                                    <i className="fas fa-times me-1"></i>Reject
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'screening' && <StockScreening />}
        </div>
    );
};

export default AdminDashboard;