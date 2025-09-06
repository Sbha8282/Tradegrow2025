# Overview

LogoCrypto is a professional financial analytics platform built with Flask that provides sector analysis, interactive charts, and comprehensive watchlist management for investors and financial professionals. The application offers real-time market data visualization, multi-category watchlist organization, and user account management with subscription tiers.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap 5 for responsive UI
- **JavaScript Libraries**: Chart.js for data visualization, vanilla JavaScript for interactive features
- **Styling**: Custom CSS with CSS variables for theming, Bootstrap components for layout
- **Client-side Logic**: Modular JavaScript files for authentication and dashboard functionality

## Backend Architecture
- **Web Framework**: Flask with Flask-Login for session management
- **Application Structure**: Modular design with separate files for routes, models, and data services
- **Authentication**: Flask-Login with password hashing using Werkzeug security utilities
- **Data Storage**: In-memory storage using Python dictionaries for MVP (users_db, watchlists_db, user_watchlists_db)
- **Session Management**: Flask sessions with configurable secret key via environment variables

## Data Layer
- **User Management**: User model with UUID-based identification, email authentication, and subscription tiers
- **Watchlist System**: Three watchlist types (breakout, speculative, normal) with stock data management
- **Market Data**: Mock financial data service generating sector and stock information for 7 major sectors
- **Data Models**: Simple Python classes with in-memory persistence for rapid prototyping

## Security & Configuration
- **Password Security**: Werkzeug password hashing for secure credential storage
- **Environment Configuration**: Environment-based secret key management
- **Proxy Support**: ProxyFix middleware for deployment behind reverse proxies
- **User Sessions**: Secure session handling with login requirements for protected routes

# External Dependencies

## Frontend Libraries
- **Bootstrap 5**: UI framework via CDN for responsive design and components
- **Font Awesome 6.4.0**: Icon library via CDN for UI iconography
- **Chart.js**: JavaScript charting library via CDN for financial data visualization

## Python Packages
- **Flask**: Core web framework for application structure
- **Flask-Login**: User session management and authentication
- **Werkzeug**: WSGI utilities including password hashing and proxy fixes

## Development Environment
- **Logging**: Python's built-in logging module configured for debug-level output
- **Development Server**: Flask's built-in development server with debug mode enabled
- **Static Assets**: Flask's static file serving for CSS and JavaScript files

Note: The application currently uses in-memory storage for MVP purposes and may require database integration (likely PostgreSQL with Drizzle ORM) for production deployment.