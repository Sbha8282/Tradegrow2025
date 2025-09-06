import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Check if this is an admin login attempt
        const isAdminLogin = window.location.pathname.includes('/admin');
        const endpoint = isAdminLogin ? '/admin/login' : '/api/auth/login';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                if (isAdminLogin) {
                    // For admin login, redirect to admin dashboard
                    window.location.href = '/admin/dashboard';
                } else {
                    // For regular user login
                    onLogin(data.user);
                    navigate('/dashboard');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="main-content" style={{
            minHeight: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div className="login-card" style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                maxWidth: '400px',
                width: '100%'
            }}>
                <h2 className="text-center mb-4">Log In</h2>
                
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email address*</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            id="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="jane.doe@gmail.com" 
                            required 
                            style={{padding: '12px'}}
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="password" className="form-label">Password*</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            id="password" 
                            name="password" 
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password" 
                            required 
                            style={{padding: '12px'}}
                        />
                    </div>
                    
                    <div className="d-grid mb-4">
                        <button 
                            type="submit" 
                            className="btn btn-primary-custom"
                            disabled={loading}
                            style={{
                                backgroundColor: '#20c997',
                                borderColor: '#20c997',
                                color: 'white',
                                fontWeight: '500',
                                padding: '12px'
                            }}
                        >
                            {loading ? 'Signing in...' : 'Continue'}
                        </button>
                    </div>
                </form>
                
                <div className="text-center">
                    <div className="d-grid gap-1 mb-3">
                        <a href="/auth/google" className="social-btn" style={{
                            border: '1px solid #e0e6ed',
                            background: 'white',
                            color: '#495057',
                            padding: '12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.5rem',
                            transition: 'all 0.2s'
                        }}>
                            <i className="fab fa-google me-2" style={{color: '#db4437'}}></i>Continue with Google
                        </a>
                        <a href="/auth/microsoft" className="social-btn" style={{
                            border: '1px solid #e0e6ed',
                            background: 'white',
                            color: '#495057',
                            padding: '12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.5rem',
                            transition: 'all 0.2s'
                        }}>
                            <i className="fab fa-microsoft me-2" style={{color: '#0078d4'}}></i>Continue with Microsoft
                        </a>
                        <a href="/auth/apple" className="social-btn" style={{
                            border: '1px solid #e0e6ed',
                            background: 'white',
                            color: '#495057',
                            padding: '12px',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '0.5rem',
                            transition: 'all 0.2s'
                        }}>
                            <i className="fab fa-apple me-2" style={{color: '#000000'}}></i>Continue with Apple
                        </a>
                    </div>
                    
                    <p className="small text-muted">
                        Don't have account? <Link to="/signup" className="text-primary text-decoration-none">Sign Up</Link>
                    </p>
                    <p className="small text-muted mt-2">
                        <Link to="/admin/login" className="text-muted">
                            <i className="fas fa-user-shield me-1"></i>Admin Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;