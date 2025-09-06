import React, { useState, useEffect } from 'react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [subscriptionFilter, setSubscriptionFilter] = useState('all');
    const [selectedUserWatchlists, setSelectedUserWatchlists] = useState(null);
    const [showWatchlistModal, setShowWatchlistModal] = useState(false);
    const [newStockSymbol, setNewStockSymbol] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/admin/api/users');
            const data = await response.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
        setLoading(false);
    };

    const updateSubscription = async (userId, newTier) => {
        try {
            const response = await fetch(`/admin/users/${userId}/subscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId, tier: newTier })
            });
            
            const data = await response.json();
            if (data.success) {
                // Update user in state
                setUsers(users.map(user => 
                    user.id === userId ? { ...user, subscription_tier: newTier } : user
                ));
                alert(data.message);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to update subscription:', error);
            alert('Failed to update subscription');
        }
    };

    const addSubscription = async (userId, tier) => {
        try {
            const response = await fetch(`/admin/users/${userId}/add-subscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tier })
            });
            
            const data = await response.json();
            if (data.success) {
                setUsers(users.map(user => 
                    user.id === userId ? { ...user, subscription_tier: tier } : user
                ));
                alert(data.message);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to add subscription:', error);
            alert('Failed to add subscription');
        }
    };

    const cancelSubscription = async (userId) => {
        if (!confirm('Are you sure you want to cancel this user\'s subscription? They will be downgraded to Free tier.')) {
            return;
        }

        try {
            const response = await fetch(`/admin/users/${userId}/remove-subscription`, {
                method: 'POST'
            });
            
            const data = await response.json();
            if (data.success) {
                setUsers(users.map(user => 
                    user.id === userId ? { ...user, subscription_tier: 'free' } : user
                ));
                alert(data.message);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            alert('Failed to cancel subscription');
        }
    };

    const viewUserWatchlists = async (userId) => {
        try {
            const response = await fetch(`/admin/watchlists/user/${userId}`);
            const data = await response.json();
            if (data.success) {
                setSelectedUserWatchlists(data);
                setShowWatchlistModal(true);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to fetch user watchlists:', error);
            alert('Failed to fetch user watchlists');
        }
    };

    const addStockToWatchlist = async (watchlistId) => {
        if (!newStockSymbol) {
            alert('Please enter a stock symbol');
            return;
        }

        try {
            const response = await fetch(`/admin/watchlists/${watchlistId}/add-stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol: newStockSymbol.toUpperCase() })
            });
            
            const data = await response.json();
            if (data.success) {
                // Refresh watchlist data
                viewUserWatchlists(selectedUserWatchlists.user.id || selectedUserWatchlists.watchlists[0]?.user_id);
                setNewStockSymbol('');
                alert(data.message);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to add stock:', error);
            alert('Failed to add stock');
        }
    };

    const removeStockFromWatchlist = async (watchlistId, symbol) => {
        if (!confirm(`Are you sure you want to remove ${symbol}?`)) {
            return;
        }

        try {
            const response = await fetch(`/admin/watchlists/${watchlistId}/remove-stock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol })
            });
            
            const data = await response.json();
            if (data.success) {
                // Refresh watchlist data
                viewUserWatchlists(selectedUserWatchlists.user.id || selectedUserWatchlists.watchlists[0]?.user_id);
                alert(data.message);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to remove stock:', error);
            alert('Failed to remove stock');
        }
    };

    const deleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/admin/users/${userId}/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });
            
            const data = await response.json();
            if (data.success) {
                setUsers(users.filter(user => user.id !== userId));
                alert(data.message);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesSubscription = subscriptionFilter === 'all' || user.subscription_tier === subscriptionFilter;
        return matchesSearch && matchesSubscription;
    });

    const updateAllStocks = async () => {
        if (!confirm('This will update stock data for all user watchlists. Continue?')) {
            return;
        }

        try {
            const response = await fetch('/admin/stocks/update', {
                method: 'POST'
            });
            
            const data = await response.json();
            if (data.success) {
                alert(`Success! ${data.message}`);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to update stocks:', error);
            alert('Failed to update stocks');
        }
    };

    const getTierBadge = (tier) => {
        const colors = {
            free: 'secondary',
            medium: 'info',
            pro: 'success'
        };
        return (
            <span className={`badge bg-${colors[tier] || 'secondary'}`}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="row mb-4">
                <div className="col">
                    <h4>User Management</h4>
                    <p className="text-muted">Manage user accounts and subscriptions</p>
                </div>
            </div>

            {/* Filters */}
            <div className="row mb-4">
                <div className="col-md-6">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by email or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <select
                        className="form-control"
                        value={subscriptionFilter}
                        onChange={(e) => setSubscriptionFilter(e.target.value)}
                    >
                        <option value="all">All Subscriptions</option>
                        <option value="free">Free</option>
                        <option value="medium">Medium</option>
                        <option value="pro">Pro</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary" onClick={fetchUsers}>
                            <i className="fas fa-sync me-2"></i>Refresh
                        </button>
                        <button className="btn btn-success" onClick={updateAllStocks}>
                            <i className="fas fa-chart-line me-2"></i>Update All Stocks
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Subscription</th>
                                    <th>Admin</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div>
                                                <div className="fw-bold">{user.full_name || user.email}</div>
                                                <small className="text-muted">{user.email}</small>
                                            </div>
                                        </td>
                                        <td>{getTierBadge(user.subscription_tier)}</td>
                                        <td>
                                            {user.is_admin ? (
                                                <span className="badge bg-danger">Admin</span>
                                            ) : (
                                                <span className="badge bg-light text-dark">User</span>
                                            )}
                                        </td>
                                        <td>
                                            <small>{new Date(user.created_at).toLocaleDateString()}</small>
                                        </td>
                                        <td>
                                            <div className="dropdown">
                                                <button className="btn btn-sm btn-outline-primary dropdown-toggle" 
                                                        type="button" data-bs-toggle="dropdown">
                                                    Actions
                                                </button>
                                                <ul className="dropdown-menu">
                                                    <li><h6 className="dropdown-header">Subscription Management</h6></li>
                                                    <li>
                                                        <button className="dropdown-item" 
                                                                onClick={() => updateSubscription(user.id, 'free')}
                                                                disabled={user.subscription_tier === 'free'}>
                                                            <i className="fas fa-user me-2 text-secondary"></i>Free
                                                            {user.subscription_tier === 'free' && <span className="ms-2 badge bg-secondary">Current</span>}
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="dropdown-item" 
                                                                onClick={() => updateSubscription(user.id, 'medium')}
                                                                disabled={user.subscription_tier === 'medium'}>
                                                            <i className="fas fa-gem me-2 text-primary"></i>Medium
                                                            {user.subscription_tier === 'medium' && <span className="ms-2 badge bg-primary">Current</span>}
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="dropdown-item" 
                                                                onClick={() => updateSubscription(user.id, 'pro')}
                                                                disabled={user.subscription_tier === 'pro'}>
                                                            <i className="fas fa-star me-2 text-warning"></i>Pro
                                                            {user.subscription_tier === 'pro' && <span className="ms-2 badge bg-warning text-dark">Current</span>}
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="dropdown-item text-danger" 
                                                                onClick={() => cancelSubscription(user.id)}
                                                                disabled={user.subscription_tier === 'free'}>
                                                            <i className="fas fa-times me-2"></i>Cancel Subscription
                                                        </button>
                                                    </li>
                                                    <li><hr className="dropdown-divider" /></li>
                                                    <li>
                                                        <button className="dropdown-item" 
                                                                onClick={() => viewUserWatchlists(user.id)}>
                                                            <i className="fas fa-list me-2"></i>View Watchlists
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button className="dropdown-item text-danger" 
                                                                onClick={() => deleteUser(user.id)}
                                                                disabled={user.is_admin}>
                                                            <i className="fas fa-trash me-2"></i>Delete User
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-4">
                            <i className="fas fa-users fa-3x text-muted mb-3"></i>
                            <p className="text-muted">No users found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Watchlist Management Modal */}
            {showWatchlistModal && selectedUserWatchlists && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Watchlists for {selectedUserWatchlists?.user?.full_name || selectedUserWatchlists?.user?.email || 'User'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowWatchlistModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {selectedUserWatchlists.watchlists.map(watchlist => (
                                    <div key={watchlist.id} className="card mb-3">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0">{watchlist.name}</h6>
                                            <div className="d-flex gap-2 align-items-center">
                                                <span className={`badge bg-${watchlist.type === 'breakout' ? 'success' : watchlist.type === 'speculative' ? 'warning' : 'primary'}`}>
                                                    {watchlist.type}
                                                </span>
                                                <span className="text-muted small">{watchlist.stock_count} stocks</span>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="row mb-3">
                                                <div className="col-md-8">
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Enter stock symbol (e.g., AAPL)"
                                                        value={newStockSymbol}
                                                        onChange={(e) => setNewStockSymbol(e.target.value)}
                                                    />
                                                </div>
                                                <div className="col-md-4">
                                                    <button 
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => addStockToWatchlist(watchlist.id)}
                                                    >
                                                        <i className="fas fa-plus me-1"></i>Add Stock
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                <table className="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th>Symbol</th>
                                                            <th>Price</th>
                                                            <th>Change</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {watchlist.stocks.map(stock => (
                                                            <tr key={stock.symbol}>
                                                                <td className="fw-bold">{stock.symbol}</td>
                                                                <td>${stock.price}</td>
                                                                <td>
                                                                    <span className={`text-${stock.change_percent > 0 ? 'success' : 'danger'}`}>
                                                                        {stock.change_percent > 0 ? '+' : ''}{stock.change_percent}%
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => removeStockFromWatchlist(watchlist.id, stock.symbol)}
                                                                    >
                                                                        <i className="fas fa-times"></i>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {showWatchlistModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default UserManagement;