# TradingGrow - Professional Financial Analytics Platform

<div align="center">
  <h3>🚀 Comprehensive dual-dashboard financial analytics platform with admin and user management</h3>
  <p>Built with React SPA, Flask backend, and modern financial data visualization</p>
</div>

## 🌟 Features

### 📊 **User Dashboard**
- **Interactive Stock Charts** - Real-time financial data visualization with Chart.js
- **Watchlist Management** - Create and manage multiple stock watchlists
- **Subscription Status** - Real-time subscription tier indicators with color-coded badges
- **Responsive Design** - Mobile-first Bootstrap 5 interface

### 👨‍💼 **Admin Dashboard**
- **User Management** - Complete CRUD operations for user accounts
- **Subscription Management** - 4-tier subscription system (Free, Medium, Pro, Cancel)
- **Stock Screening Tools** - Advanced filtering and analysis capabilities
- **Analytics & Reporting** - User statistics and platform insights
- **Request Management** - Handle subscription upgrade requests

### 🔐 **Authentication & Security**
- **Google OAuth 2.0** - Secure single sign-on authentication
- **Session Management** - Flask-Login with secure session handling
- **Role-Based Access** - Admin and user role separation
- **Password Security** - Werkzeug hashing for secure credential storage

## 🏗️ Technology Stack

### **Frontend**
- **React 19.1.1** - Modern SPA with hooks and context
- **React Router 7.8.2** - Client-side routing
- **Chart.js 4.5.0** - Advanced financial charting
- **Bootstrap 5** - Responsive UI framework
- **Webpack 5** - Module bundling and asset optimization

### **Backend**
- **Flask** - Python web framework
- **Flask-Login** - User session management
- **Flask-SQLAlchemy** - Database ORM
- **Flask-Dance** - OAuth integration
- **PostgreSQL** - Production database
- **Gunicorn** - Production WSGI server

### **Development Tools**
- **Babel** - JavaScript transpilation
- **ESLint** - Code linting
- **Webpack Dev Server** - Hot module replacement

## 📦 Installation & Setup

### **Prerequisites**
- Python 3.11+
- Node.js 18+
- PostgreSQL database
- Google OAuth 2.0 credentials

### **1. Clone Repository**
```bash
git clone <your-repo-url>
cd tradinggrow
```

### **2. Install Backend Dependencies**
```bash
pip install flask flask-login flask-sqlalchemy flask-dance gunicorn psycopg2-binary requests werkzeug oauthlib email-validator pyjwt stripe
```

### **3. Install Frontend Dependencies**
```bash
npm install
```

### **4. Build React Frontend**
```bash
# Development build
npx webpack --mode development

# Production build
npx webpack --mode production
```

### **5. Environment Variables**
Create `.env` file:
```env
# Required
SESSION_SECRET=your-secure-secret-key-here
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
DATABASE_URL=postgresql://username:password@host:port/database

# Optional
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### **6. Database Setup**
```bash
# Initialize database tables
python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

### **7. Create Admin User**
```bash
python create_admin.py
```

## 🚀 Running the Application

### **Development Mode**
```bash
python main.py
```
Application runs on `http://localhost:5000`

### **Production Mode**
```bash
gunicorn --bind 0.0.0.0:5000 --reuse-port --reload main:app
```

## 🌐 Deployment Options

### **Heroku**
```bash
git init
heroku create tradinggrow-app
heroku addons:create heroku-postgresql
heroku config:set SESSION_SECRET=your-secret
heroku config:set GOOGLE_CLIENT_ID=your-id
heroku config:set GOOGLE_CLIENT_SECRET=your-secret
echo "web: gunicorn main:app" > Procfile
git add . && git commit -m "Deploy"
git push heroku main
```

### **Railway**
```bash
railway login
railway new
railway add postgresql
railway up
```

### **Render**
- Connect GitHub repository
- Build Command: `npm install && npx webpack --mode production && pip install -r requirements.txt`
- Start Command: `gunicorn main:app`

## 📱 Usage

### **Access Points**
- **Main Application**: `http://localhost:5000/`
- **Admin Dashboard**: `http://localhost:5000/admin/`
- **User Dashboard**: `http://localhost:5000/dashboard/`

### **Default Credentials**
- **Admin**: `admin@tradinggrow.com` / `admin123`

### **User Flow**
1. **Sign Up/Login** - Google OAuth authentication
2. **Choose Subscription** - Free, Medium, or Pro tier
3. **Access Dashboard** - View financial data and manage watchlists
4. **Admin Management** - Admins can manage users and subscriptions

## 📁 Project Structure

```
tradinggrow/
├── frontend/                 # React SPA source
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/       # Admin dashboard components
│   │   │   ├── user/        # User dashboard components
│   │   │   └── layout/      # Shared layout components
│   │   ├── App.jsx          # Main React application
│   │   └── index.jsx        # Application entry point
├── templates/               # Jinja2 HTML templates
├── static/                  # Static assets and compiled JS
├── app.py                   # Flask application factory
├── main.py                  # Application entry point
├── models.py                # Database models
├── admin_routes.py          # Admin API routes
├── api_routes.py            # User API routes
├── routes.py                # Main application routes
├── oauth_config.py          # OAuth configuration
├── data_service.py          # Mock data service
├── webpack.config.js        # Frontend build configuration
└── package.json            # Node.js dependencies
```

## 🔧 Configuration

### **Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `https://your-domain.com/google/authorized`
   - `http://localhost:5000/google/authorized` (for development)

### **Database Configuration**
- **Development**: SQLite (default)
- **Production**: PostgreSQL (recommended)
- **Environment**: Set `DATABASE_URL` for custom database

### **Subscription Tiers**
- **Free**: Basic features, limited access
- **Medium**: Enhanced features, more data access
- **Pro**: Full features, unlimited access
- **Admin**: Full platform management

## 🛠️ Development

### **Building Frontend**
```bash
# Watch mode for development
npx webpack --mode development --watch

# Production build
npx webpack --mode production
```

### **Adding New Features**
1. **Frontend**: Add React components in `frontend/src/components/`
2. **Backend**: Add routes in appropriate route files
3. **Database**: Update models in `models.py`
4. **Build**: Rebuild frontend with webpack

### **Testing**
```bash
# Backend testing
python -m pytest

# Frontend testing (if configured)
npm test
```

## 📊 API Endpoints

### **Authentication**
- `GET /google/login` - Google OAuth login
- `GET /google/authorized` - OAuth callback
- `GET /logout` - User logout

### **User API**
- `GET /api/user/data` - Get user profile data
- `GET /api/dashboard/data` - Get dashboard data
- `POST /api/watchlist` - Create watchlist
- `GET /api/sectors` - Get sector data

### **Admin API**
- `GET /admin/api/users` - Get all users
- `POST /admin/api/users/:id/subscription` - Update user subscription
- `GET /admin/api/dashboard-data` - Get admin dashboard data
- `GET /admin/api/screenings` - Get stock screenings

## 🔒 Security Features

- **CSRF Protection** - Built-in Flask security
- **OAuth 2.0** - Secure third-party authentication
- **Environment Variables** - Sensitive data protection
- **Session Security** - Secure cookie handling
- **Role-Based Access** - Admin/user permission system

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

<div align="center">
  <p>Built with ❤️ for financial professionals and investors</p>
  <p><strong>TradingGrow - Professional Financial Analytics Platform</strong></p>
</div>