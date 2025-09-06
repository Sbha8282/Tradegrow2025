import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage = ({ code = '404', title = 'Page Not Found', message = 'The page you are looking for does not exist.' }) => {
    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
                <h1 className="display-1 fw-bold text-primary">{code}</h1>
                <p className="fs-3"><span className="text-danger">Oops!</span> {title}</p>
                <p className="lead">{message}</p>
                <Link to="/" className="btn btn-primary">Go Home</Link>
            </div>
        </div>
    );
};

export default ErrorPage;