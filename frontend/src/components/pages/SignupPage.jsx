import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SignupPage = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
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

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data.user);
                navigate('/dashboard');
            } else {
                setError(data.error || 'Signup failed');
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
                <h2 className="text-center mb-4">Create Account</h2>
                
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username*</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="username" 
                            name="username" 
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your username" 
                            required 
                            style={{padding: '12px'}}
                        />
                    </div>

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
                    
                    <div className="mb-3">
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

                    <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password*</label>
                        <input 
                            type="password" 
                            className="form-control" 
                            id="confirmPassword" 
                            name="confirmPassword" 
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password" 
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
                            {loading ? 'Creating Account...' : 'Create Account'}
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
                        Already have an account? <Link to="/login" className="text-primary text-decoration-none">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;