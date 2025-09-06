import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const UserDashboard = () => {
    const [user, setUser] = useState(null);
    const [watchlists, setWatchlists] = useState([]);
    const [sectorData, setSectorData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState('sectors'); // 'sectors' or 'watchlists'
    const [marketType, setMarketType] = useState('US');
    const [marketCharts, setMarketCharts] = useState('All');
    const [chartWatchlist, setChartWatchlist] = useState('All');
    const [minMSD, setMinMSD] = useState(50);
    const [minVol, setMinVol] = useState(1);
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

    useEffect(() => {
        // Get data from window variables set by Flask template
        if (window.userData) {
            setUser(window.userData.user || { subscription_tier: 'free' });
            setWatchlists(window.userData.watchlists || []);
            setSectorData(window.userData.sectorData || {});
        }
        setLoading(false);
        
        // Auto-refresh subscription status every 30 seconds
        const interval = setInterval(refreshUserData, 30000);
        return () => clearInterval(interval);
    }, []);

    const refreshUserData = async () => {
        try {
            const response = await fetch('/api/user/data');
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setWatchlists(data.watchlists);
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
        }
    };

    const resetFilters = () => {
        setMarketType('US');
        setMarketCharts('All');
        setChartWatchlist('All');
        setMinMSD(50);
        setMinVol(1);
    };

    const handleGetStarted = async (tier) => {
        // Redirect to external subscription page or payment processor
        const subscriptionUrls = {
            medium: 'https://buy.stripe.com/medium-plan', // Replace with actual Stripe links
            pro: 'https://buy.stripe.com/pro-plan' // Replace with actual Stripe links
        };
        
        // For now, show a message and close modal
        alert(`Redirecting to ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan subscription...`);
        setShowSubscriptionModal(false);
        
        // In production, you would redirect to the payment processor:
        // window.location.href = subscriptionUrls[tier];
    };
    
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            // Redirect to login page
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed:', error);
            // Force redirect anyway
            window.location.href = '/login';
        }
    };

    const getSectorChartData = (sector) => {
        // Generate time series data for the sector
        const months = ['Sep 2024', 'Nov 2024', 'Jan 2025', 'Mar 2025', 'May 2025', 'Jul 2025'];
        const baseValue = Math.random() * 100 + 50;
        const data = months.map((month, index) => ({
            x: month,
            y: baseValue + (Math.random() - 0.5) * 20 + index * 2
        }));
        
        return {
            labels: months,
            datasets: [{
                label: 'Price',
                data: data.map(d => d.y),
                borderColor: '#4F46E5',
                backgroundColor: 'transparent',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 4
            }]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        },
        scales: {
            x: {
                display: true,
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                display: true,
                grid: {
                    color: 'rgba(0,0,0,0.1)'
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    if (loading) {
        return <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status"></div>
        </div>;
    }

    return (
        <div className="d-flex vh-100 bg-light">
            {/* Dark Sidebar */}
            <div className="bg-dark text-white p-3" style={{ width: '280px', minHeight: '100vh' }}>
                {/* Settings Header */}
                <div className="d-flex align-items-center mb-3">
                    <i className="fas fa-cog me-2"></i>
                    <h6 className="mb-0">Settings</h6>
                </div>

                {/* Select Market Types */}
                <div className="mb-2">
                    <label className="form-label text-white-50 small">Select Market Types</label>
                    <select 
                        className="form-select form-select-sm bg-secondary text-white border-secondary"
                        value={marketType}
                        onChange={(e) => setMarketType(e.target.value)}
                    >
                        <option value="US">🇺🇸 Select Market</option>
                        <option value="EU">🇪🇺 European Markets</option>
                        <option value="ASIA">🌏 Asian Markets</option>
                    </select>
                </div>

                {/* Select Market */}
                <div className="mb-2">
                    <label className="form-label text-white-50 small">Select Market</label>
                    <select 
                        className="form-select form-select-sm bg-secondary text-white border-secondary"
                        value={marketCharts}
                        onChange={(e) => setMarketCharts(e.target.value)}
                    >
                        <option value="All">📊 Select Market Charts</option>
                        <option value="NYSE">NYSE</option>
                        <option value="NASDAQ">NASDAQ</option>
                        <option value="S&P500">S&P 500</option>
                    </select>
                </div>

                {/* Chart Watchlist */}
                <div className="mb-3">
                    <label className="form-label text-white-50 small">Chart Watchlist</label>
                    <select 
                        className="form-select form-select-sm bg-secondary text-white border-secondary"
                        value={chartWatchlist}
                        onChange={(e) => setChartWatchlist(e.target.value)}
                    >
                        <option value="All">📈 Select Market Charts</option>
                        <option value="Breakout">Breakout</option>
                        <option value="Speculative">Speculative</option>
                        <option value="Normal">Normal</option>
                    </select>
                </div>

                {/* Data Filters */}
                <div className="mb-3">
                    <h6 className="text-white-50 small mb-2">Data Filters</h6>
                    
                    {/* Market Filter */}
                    <div className="mb-2 d-flex align-items-center justify-content-between">
                        <label className="text-white small">Market</label>
                        <select 
                            className="form-select form-select-sm bg-secondary text-white border-secondary"
                            style={{ width: '70px' }}
                            value={marketType}
                            onChange={(e) => setMarketType(e.target.value)}
                        >
                            <option value="US">US</option>
                            <option value="EU">EU</option>
                            <option value="ASIA">ASIA</option>
                        </select>
                    </div>

                    {/* MSD Min Filter */}
                    <div className="mb-2 d-flex align-items-center justify-content-between">
                        <label className="text-white small">MSD Min</label>
                        <input 
                            type="number" 
                            className="form-control form-control-sm bg-secondary text-white border-secondary text-center"
                            style={{ width: '70px' }}
                            value={minMSD}
                            onChange={(e) => setMinMSD(e.target.value)}
                        />
                    </div>

                    {/* Min Vol Filter */}
                    <div className="mb-3 d-flex align-items-center justify-content-between">
                        <label className="text-white small">Min Vol (M)</label>
                        <input 
                            type="number" 
                            className="form-control form-control-sm bg-secondary text-white border-secondary text-center"
                            style={{ width: '70px' }}
                            value={minVol}
                            onChange={(e) => setMinVol(e.target.value)}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-2 mb-3">
                    <button 
                        className="btn btn-warning btn-sm fw-bold"
                        onClick={resetFilters}
                    >
                        Reset
                    </button>
                    <button 
                        className="btn btn-info btn-sm fw-bold"
                        onClick={() => setActiveView(activeView === 'sectors' ? 'watchlists' : 'sectors')}
                    >
                        {activeView === 'sectors' ? 'View Watchlists' : 'View Charts'}
                    </button>
                </div>

                {/* Subscription Button */}
                <div className="mt-auto">
                    <button 
                        className="btn btn-danger w-100 d-flex align-items-center justify-content-between"
                        onClick={() => setShowSubscriptionModal(true)}
                    >
                        <span>
                            <i className="fas fa-crown me-2"></i>
                            Subscription
                        </span>
                        <i className="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-fill p-4 bg-white">
                {activeView === 'sectors' ? (
                    // Sector Charts View
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h4 className="mb-1">SECTOR CHARTS</h4>
                                <small className="text-muted">
                                    Bullish sectors only (+0.1 So ($0.16k), Volume: MSD vs S&P500)
                                </small>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <span className={`badge px-2 py-1 text-white fw-bold`} 
                                      style={{
                                          backgroundColor: user?.subscription_tier === 'free' ? '#6c757d' :
                                                          user?.subscription_tier === 'medium' ? '#0d6efd' : '#ffc107',
                                          color: user?.subscription_tier === 'pro' ? '#000' : '#fff',
                                          fontSize: '11px',
                                          borderRadius: '15px',
                                          boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                                      }}>
                                    <i className="fas fa-crown me-1" style={{fontSize: '10px'}}></i>
                                    {user?.subscription_tier ? 
                                        user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1) : 
                                        'Free'
                                    }
                                </span>
                                <button 
                                    onClick={refreshUserData}
                                    className="btn btn-outline-info btn-sm"
                                    style={{fontSize: '12px', padding: '4px 12px'}}
                                    title="Refresh subscription status"
                                >
                                    <i className="fas fa-sync-alt me-1"></i>
                                    Refresh
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="btn btn-outline-light btn-sm"
                                    style={{fontSize: '12px', padding: '4px 12px'}}
                                >
                                    <i className="fas fa-sign-out-alt me-1"></i>
                                    Logout
                                </button>
                            </div>
                        </div>

                        <div className="row g-4">
                            {/* Technology */}
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="card-title mb-0 fw-bold">Technology</h6>
                                            <span className="badge text-white px-3 py-1" 
                                                  style={{backgroundColor: '#10b981', fontSize: '11px', borderRadius: '20px'}}>
                                                Bullish
                                            </span>
                                        </div>
                                        <div style={{ height: '200px' }}>
                                            <Line data={getSectorChartData('Technology')} options={chartOptions} />
                                        </div>
                                        <div className="mt-3">
                                            <button 
                                                className="btn w-100"
                                                style={{
                                                    background: '#f8fafc', 
                                                    border: '1px solid #e2e8f0',
                                                    color: '#475569',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    borderRadius: '8px',
                                                    padding: '8px 16px'
                                                }}
                                                onClick={() => setActiveView('watchlists')}
                                            >
                                                <i className="fas fa-list me-2"></i>View Stocks
                                            </button>
                                        </div>
                                        <div className="mt-2">
                                            <small className="text-muted d-flex flex-wrap gap-2">
                                                <span style={{color: '#3b82f6'}}>● Price</span>
                                                <span style={{color: '#ef4444'}}>● SOHA</span>
                                                <span style={{color: '#f59e0b'}}>● ROAHA</span>
                                                <span style={{color: '#8b5cf6'}}>● Volume</span>
                                                <span style={{color: '#06b6d4'}}>● MRI</span>
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financials */}
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="card-title mb-0 fw-bold">Financials</h6>
                                            <span className="badge text-white px-3 py-1" 
                                                  style={{backgroundColor: '#10b981', fontSize: '11px', borderRadius: '20px'}}>
                                                Bullish
                                            </span>
                                        </div>
                                        <div style={{ height: '200px' }}>
                                            <Line data={getSectorChartData('Financials')} options={chartOptions} />
                                        </div>
                                        <div className="mt-3">
                                            <button 
                                                className="btn w-100"
                                                style={{
                                                    background: '#f8fafc', 
                                                    border: '1px solid #e2e8f0',
                                                    color: '#475569',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    borderRadius: '8px',
                                                    padding: '8px 16px'
                                                }}
                                                onClick={() => setActiveView('watchlists')}
                                            >
                                                <i className="fas fa-list me-2"></i>View Stocks
                                            </button>
                                        </div>
                                        <div className="mt-2">
                                            <small className="text-muted d-flex flex-wrap gap-2">
                                                <span style={{color: '#3b82f6'}}>● Price</span>
                                                <span style={{color: '#ef4444'}}>● SOHA</span>
                                                <span style={{color: '#f59e0b'}}>● ROAHA</span>
                                                <span style={{color: '#8b5cf6'}}>● Volume</span>
                                                <span style={{color: '#06b6d4'}}>● MRI</span>
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Wholesale Distributors */}
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="card-title mb-0 fw-bold">Wholesale Distributors</h6>
                                            <span className="badge text-white px-3 py-1" 
                                                  style={{backgroundColor: '#10b981', fontSize: '11px', borderRadius: '20px'}}>
                                                Bullish
                                            </span>
                                        </div>
                                        <div style={{ height: '200px' }}>
                                            <Line data={getSectorChartData('Wholesale')} options={chartOptions} />
                                        </div>
                                        <div className="mt-3">
                                            <button 
                                                className="btn w-100"
                                                style={{
                                                    background: '#f8fafc', 
                                                    border: '1px solid #e2e8f0',
                                                    color: '#475569',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    borderRadius: '8px',
                                                    padding: '8px 16px'
                                                }}
                                                onClick={() => setActiveView('watchlists')}
                                            >
                                                <i className="fas fa-list me-2"></i>View Stocks
                                            </button>
                                        </div>
                                        <div className="mt-2">
                                            <small className="text-muted d-flex flex-wrap gap-2">
                                                <span style={{color: '#3b82f6'}}>● Price</span>
                                                <span style={{color: '#ef4444'}}>● SOHA</span>
                                                <span style={{color: '#f59e0b'}}>● ROAHA</span>
                                                <span style={{color: '#8b5cf6'}}>● Volume</span>
                                                <span style={{color: '#06b6d4'}}>● MRI</span>
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tobacco */}
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="card-title mb-0 fw-bold">Tobacco</h6>
                                            <span className="badge text-white px-3 py-1" 
                                                  style={{backgroundColor: '#10b981', fontSize: '11px', borderRadius: '20px'}}>
                                                Bullish
                                            </span>
                                        </div>
                                        <div style={{ height: '200px' }}>
                                            <Line data={getSectorChartData('Tobacco')} options={chartOptions} />
                                        </div>
                                        <div className="mt-3">
                                            <button 
                                                className="btn w-100"
                                                style={{
                                                    background: '#f8fafc', 
                                                    border: '1px solid #e2e8f0',
                                                    color: '#475569',
                                                    fontSize: '13px',
                                                    fontWeight: '500',
                                                    borderRadius: '8px',
                                                    padding: '8px 16px'
                                                }}
                                                onClick={() => setActiveView('watchlists')}
                                            >
                                                <i className="fas fa-list me-2"></i>View Stocks
                                            </button>
                                        </div>
                                        <div className="mt-2">
                                            <small className="text-muted d-flex flex-wrap gap-2">
                                                <span style={{color: '#3b82f6'}}>● Price</span>
                                                <span style={{color: '#ef4444'}}>● SOHA</span>
                                                <span style={{color: '#f59e0b'}}>● ROAHA</span>
                                                <span style={{color: '#8b5cf6'}}>● Volume</span>
                                                <span style={{color: '#06b6d4'}}>● MRI</span>
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Watchlists View
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h4 className="mb-1">CHARTS WATCHLIST</h4>
                                <small className="text-muted">
                                    Bullish sectors only (+0.1 So ($0.16k), Volume: MSD vs S&P500)
                                </small>
                            </div>
                            <span className="text-muted small">Settings</span>
                        </div>

                        {/* Breakout Watchlist */}
                        <div className="mb-5">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">BREAKOUT WATCHLIST</h5>
                                <small className="text-muted">Synced data updated to FinanceStation</small>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Stock Sector</th>
                                            <th>Stock</th>
                                            <th>Symbol</th>
                                            <th>Price</th>
                                            <th>My Buy Point</th>
                                            <th>Market Cap Category</th>
                                            <th>Country</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {watchlists.filter(w => w.type === 'breakout').map(watchlist => 
                                            watchlist.stocks.map((stock, idx) => (
                                                <tr key={`${watchlist.id}-${idx}`}>
                                                    <td>Technology</td>
                                                    <td>{stock.symbol} Inc.</td>
                                                    <td>
                                                        <a href="#" className="text-primary fw-bold">
                                                            {stock.symbol}
                                                        </a>
                                                    </td>
                                                    <td>${stock.price}</td>
                                                    <td>${stock.buy_point || (stock.price * 0.95).toFixed(2)}</td>
                                                    <td>Large Cap</td>
                                                    <td>USA</td>
                                                </tr>
                                            ))
                                        )}
                                        {/* Default entries if no breakout stocks */}
                                        {watchlists.filter(w => w.type === 'breakout').length === 0 && (
                                            <>
                                                <tr>
                                                    <td>Technology</td>
                                                    <td>Apple Inc.</td>
                                                    <td><a href="#" className="text-primary fw-bold">AAPL</a></td>
                                                    <td>$150.25</td>
                                                    <td>$145.00</td>
                                                    <td>Large Cap</td>
                                                    <td>USA</td>
                                                </tr>
                                                <tr>
                                                    <td>Healthcare</td>
                                                    <td>Pfizer Inc.</td>
                                                    <td><a href="#" className="text-primary fw-bold">PFE</a></td>
                                                    <td>$32.10</td>
                                                    <td>$34.00</td>
                                                    <td>Large Cap</td>
                                                    <td>USA</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Speculative Watchlist */}
                        <div className="mb-5">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">SPECULATIVE WATCHLIST</h5>
                                <small className="text-muted">Stocks below 200$MA</small>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Stock Sector</th>
                                            <th>Stock</th>
                                            <th>Symbol</th>
                                            <th>Price</th>
                                            <th>My Buy Point</th>
                                            <th>Market Cap Category</th>
                                            <th>Country</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {watchlists.filter(w => w.type === 'speculative').map(watchlist => 
                                            watchlist.stocks.map((stock, idx) => (
                                                <tr key={`${watchlist.id}-${idx}`}>
                                                    <td>Biotech</td>
                                                    <td>{stock.symbol} Corp</td>
                                                    <td>
                                                        <a href="#" className="text-primary fw-bold">
                                                            {stock.symbol}
                                                        </a>
                                                    </td>
                                                    <td>${stock.price}</td>
                                                    <td>${stock.buy_point || (stock.price * 0.90).toFixed(2)}</td>
                                                    <td>Small Cap</td>
                                                    <td>USA</td>
                                                </tr>
                                            ))
                                        )}
                                        {/* Default entries */}
                                        {watchlists.filter(w => w.type === 'speculative').length === 0 && (
                                            <>
                                                <tr>
                                                    <td>Biotech</td>
                                                    <td>Sanodan</td>
                                                    <td><a href="#" className="text-primary fw-bold">SANA</a></td>
                                                    <td>$3.10</td>
                                                    <td>$8.00</td>
                                                    <td>Small Cap</td>
                                                    <td>USA</td>
                                                </tr>
                                                <tr>
                                                    <td>Technology</td>
                                                    <td>NextCloud</td>
                                                    <td><a href="#" className="text-primary fw-bold">NCOC</a></td>
                                                    <td>$12.20</td>
                                                    <td>$15.00</td>
                                                    <td>Mid Cap</td>
                                                    <td>India</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Normal Watchlist */}
                        <div className="mb-5">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">NORMAL WATCHLIST</h5>
                                <small className="text-muted">Stocks below 200$MA</small>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Stock Sector</th>
                                            <th>Stock</th>
                                            <th>Symbol</th>
                                            <th>Price</th>
                                            <th>My Buy Point</th>
                                            <th>Market Cap Category</th>
                                            <th>Country</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {watchlists.filter(w => w.type === 'normal').map(watchlist => 
                                            watchlist.stocks.map((stock, idx) => (
                                                <tr key={`${watchlist.id}-${idx}`}>
                                                    <td>Technology</td>
                                                    <td>{stock.symbol} Corp</td>
                                                    <td>
                                                        <a href="#" className="text-primary fw-bold">
                                                            {stock.symbol}
                                                        </a>
                                                    </td>
                                                    <td>${stock.price}</td>
                                                    <td>${stock.buy_point || (stock.price * 0.92).toFixed(2)}</td>
                                                    <td>Mid Cap</td>
                                                    <td>USA</td>
                                                </tr>
                                            ))
                                        )}
                                        {/* Default entries */}
                                        {watchlists.filter(w => w.type === 'normal').length === 0 && (
                                            <>
                                                <tr>
                                                    <td>Biotech</td>
                                                    <td>Sanodan</td>
                                                    <td><a href="#" className="text-primary fw-bold">SANA</a></td>
                                                    <td>$3.10</td>
                                                    <td>$3.00</td>
                                                    <td>Small Cap</td>
                                                    <td>USA</td>
                                                </tr>
                                                <tr>
                                                    <td>Technology</td>
                                                    <td>NextCloud</td>
                                                    <td><a href="#" className="text-primary fw-bold">NCOC</a></td>
                                                    <td>$12.20</td>
                                                    <td>$15.00</td>
                                                    <td>Mid Cap</td>
                                                    <td>India</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Subscription Modal */}
            {showSubscriptionModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0">
                                <h4 className="modal-title fw-bold">Choose Your Plan</h4>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowSubscriptionModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-4">
                                    {/* Free Plan */}
                                    <div className="col-md-4">
                                        <div className="card border-2 h-100 text-center">
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title fw-bold text-muted">Free</h5>
                                                <div className="mb-3">
                                                    <span className="display-4 fw-bold">$0</span>
                                                    <span className="text-muted">/month</span>
                                                </div>
                                                <ul className="list-unstyled text-start mb-4">
                                                    <li className="mb-2">✓ Basic sector charts</li>
                                                    <li className="mb-2">✓ 1 watchlist</li>
                                                    <li className="mb-2">✓ Limited stock data</li>
                                                    <li className="mb-2">✓ Community support</li>
                                                </ul>
                                                <button className="btn btn-outline-primary mt-auto" disabled>
                                                    Current Plan
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medium Plan */}
                                    <div className="col-md-4">
                                        <div className="card border-primary border-2 h-100 text-center">
                                            <div className="card-body d-flex flex-column">
                                                <h5 className="card-title fw-bold text-primary">Medium</h5>
                                                <div className="mb-3">
                                                    <span className="display-4 fw-bold text-primary">$9</span>
                                                    <span className="text-muted">.99/month</span>
                                                </div>
                                                <ul className="list-unstyled text-start mb-4">
                                                    <li className="mb-2">✓ All sector charts</li>
                                                    <li className="mb-2">✓ 5 watchlists</li>
                                                    <li className="mb-2">✓ Real-time data</li>
                                                    <li className="mb-2">✓ Advanced analytics</li>
                                                    <li className="mb-2">✓ Email alerts</li>
                                                    <li className="mb-2">✓ Priority support</li>
                                                </ul>
                                                <button 
                                                    className="btn btn-primary mt-auto"
                                                    onClick={() => handleGetStarted('medium')}
                                                >
                                                    Get Started
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pro Plan */}
                                    <div className="col-md-4">
                                        <div className="card border-warning border-2 h-100 text-center position-relative">
                                            <div className="position-absolute top-0 start-50 translate-middle">
                                                <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">
                                                    <i className="fas fa-star me-1"></i>Most Popular
                                                </span>
                                            </div>
                                            <div className="card-body d-flex flex-column pt-4">
                                                <h5 className="card-title fw-bold text-warning">Pro</h5>
                                                <div className="mb-3">
                                                    <span className="display-4 fw-bold text-warning">$19</span>
                                                    <span className="text-muted">.99/month</span>
                                                </div>
                                                <ul className="list-unstyled text-start mb-4">
                                                    <li className="mb-2">✓ Everything in Medium</li>
                                                    <li className="mb-2">✓ Unlimited watchlists</li>
                                                    <li className="mb-2">✓ AI-powered insights</li>
                                                    <li className="mb-2">✓ Custom alerts</li>
                                                    <li className="mb-2">✓ API access</li>
                                                    <li className="mb-2">✓ White-label reports</li>
                                                    <li className="mb-2">✓ 24/7 dedicated support</li>
                                                </ul>
                                                <button 
                                                    className="btn btn-warning text-dark fw-bold mt-auto"
                                                    onClick={() => handleGetStarted('pro')}
                                                >
                                                    Get Started
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="text-center mt-4">
                                    <p className="text-muted mb-0">
                                        <i className="fas fa-shield-alt me-2"></i>
                                        30-day money-back guarantee • Cancel anytime • Secure payment
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;