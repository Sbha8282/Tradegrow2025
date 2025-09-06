import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = ({ user }) => {
    return (
        <div>
            {/* Hero Section */}
            <div className="hero-section bg-light py-5">
                <div className="container text-center">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <h1 className="display-4 fw-bold mb-4">Professional Financial Analytics</h1>
                            <p className="lead mb-4">
                                Advanced sector analysis, interactive charts, and comprehensive watchlist management 
                                for serious investors and financial professionals.
                            </p>
                            <div className="d-flex justify-content-center gap-3">
                                {!user ? (
                                    <>
                                        <Link to="/signup" className="btn btn-primary btn-lg px-4">Get Started</Link>
                                        <Link to="/login" className="btn btn-outline-primary btn-lg px-4">Sign In</Link>
                                    </>
                                ) : (
                                    <Link to="/dashboard" className="btn btn-primary btn-lg px-4">Go to Dashboard</Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="features-section py-5">
                <div className="container">
                    <div className="row text-center mb-5">
                        <div className="col">
                            <h2 className="fw-bold mb-3">Powerful Features for Financial Analysis</h2>
                            <p className="text-muted">Everything you need to make informed investment decisions</p>
                        </div>
                    </div>
                    
                    <div className="row g-4">
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body text-center p-4">
                                    <div className="feature-icon bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                                        <i className="fas fa-chart-area text-primary fs-4"></i>
                                    </div>
                                    <h5 className="card-title">Interactive Sector Charts</h5>
                                    <p className="card-text text-muted">
                                        Analyze sector performance with detailed time-series charts and real-time data visualization.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body text-center p-4">
                                    <div className="feature-icon bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                                        <i className="fas fa-list-check text-success fs-4"></i>
                                    </div>
                                    <h5 className="card-title">Advanced Watchlists</h5>
                                    <p className="card-text text-muted">
                                        Organize stocks into breakout, speculative, and normal watchlists with custom buy points.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-md-4">
                            <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body text-center p-4">
                                    <div className="feature-icon bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                                        <i className="fas fa-filter text-info fs-4"></i>
                                    </div>
                                    <h5 className="card-title">Market Filters</h5>
                                    <p className="card-text text-muted">
                                        Filter markets by volume, market cap, and other criteria to find the best opportunities.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="cta-section bg-primary text-white py-5">
                <div className="container text-center">
                    <div className="row justify-content-center">
                        <div className="col-lg-6">
                            <h2 className="fw-bold mb-3">Ready to Start Analyzing?</h2>
                            <p className="mb-4">
                                Join thousands of professionals who trust TradingGrow for their financial analysis needs.
                            </p>
                            {!user ? (
                                <Link to="/signup" className="btn btn-light btn-lg px-4">Create Account</Link>
                            ) : (
                                <Link to="/dashboard" className="btn btn-light btn-lg px-4">Open Dashboard</Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;