import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children, user, onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            onLogout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f8f9fa' }}>
            {/* Navigation */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white px-4">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/" style={{ fontWeight: '600', fontSize: '1.5rem' }}>
                        <img src="/static/TradingGrow_1756851873517.png" alt="TradingGrow" style={{ height: '40px' }} />
                    </Link>
                    
                    <div className="navbar-nav me-auto">
                        {/* Navigation items */}
                    </div>
                    
                    <div className="d-flex gap-2">
                        {!user ? (
                            <>
                                <Link to="/login" className="btn btn-outline-secondary">Login</Link>
                                <Link to="/signup" className="btn btn-dark">Get Started</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/dashboard" className="btn btn-primary me-2">Dashboard</Link>
                                <button onClick={handleLogout} className="btn btn-outline-secondary">Logout</button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main>
                {children}
            </main>

            {/* Footer */}
            <footer className="footer" style={{
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '3rem 0 2rem 0'
            }}>
                <div className="container">
                    <div className="row">
                        <div className="col-md-3">
                            <h5 className="mb-3">
                                <img src="/static/TradingGrow_1756851873517.png" alt="TradingGrow" style={{ height: '30px' }} />
                            </h5>
                            <p className="small text-muted">
                                Professional financial analytics platform for serious investors and financial professionals.
                            </p>
                        </div>
                        <div className="col-md-3">
                            <h6 style={{ color: '#20c997' }}>Features</h6>
                            <ul className="list-unstyled">
                                <li><Link to="/dashboard" className="footer-link" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Dashboard</Link></li>
                                <li><Link to="#" className="footer-link" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Analytics</Link></li>
                                <li><Link to="#" className="footer-link" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Watchlists</Link></li>
                            </ul>
                        </div>
                        <div className="col-md-3">
                            <h6 style={{ color: '#20c997' }}>Resources</h6>
                            <ul className="list-unstyled">
                                <li><Link to="#" className="footer-link" style={{ color: '#bdc3c7', textDecoration: 'none' }}>About</Link></li>
                                <li><Link to="#" className="footer-link" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Blog</Link></li>
                                <li><Link to="#" className="footer-link" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Contact Us</Link></li>
                            </ul>
                        </div>
                        <div className="col-md-3">
                            <h6 style={{ color: '#20c997' }}>Follow us</h6>
                            <ul className="list-unstyled">
                                <li><a href="#" className="footer-link" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Instagram</a></li>
                                <li><a href="#" className="footer-link" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Facebook</a></li>
                                <li><a href="#" className="footer-link" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Twitter</a></li>
                            </ul>
                        </div>
                    </div>
                    <hr className="my-4" style={{ borderColor: '#34495e' }} />
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <p className="small mb-0">&copy; TradingGrow All Rights Reserved</p>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <a href="#" className="footer-link me-3" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Privacy Policy</a>
                            <a href="#" className="footer-link" style={{ color: '#bdc3c7', textDecoration: 'none' }}>Terms & Conditions</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;