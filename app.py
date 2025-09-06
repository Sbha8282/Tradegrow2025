import os
import logging
from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class Base(DeclarativeBase):
    pass

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key-change-in-production")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# Configure database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize SQLAlchemy
db = SQLAlchemy(model_class=Base)
db.init_app(app)

# Configure Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'google.login'  # type: ignore
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'info'

@login_manager.user_loader
def load_user(user_id):
    from models import User
    return User.get(user_id)

# Set up OAuth blueprints
from oauth_config import create_oauth_blueprints, setup_oauth_handlers
google_bp, microsoft_bp, apple_bp = create_oauth_blueprints(app)
setup_oauth_handlers(google_bp, microsoft_bp, apple_bp)

# Configure OAuth providers for templates
app.config['OAUTH_PROVIDERS'] = []
if google_bp:
    app.config['OAUTH_PROVIDERS'].append('google')
if microsoft_bp:
    app.config['OAUTH_PROVIDERS'].append('microsoft')

# Initialize models with database
from models import init_models
User, Watchlist, StockScreening, SubscriptionRequest = init_models(db)

# Set models in the models module for other imports
import models
models.User = User
models.Watchlist = Watchlist
models.StockScreening = StockScreening
models.SubscriptionRequest = SubscriptionRequest

# Register admin blueprint
from admin_routes import admin_bp
app.register_blueprint(admin_bp)

# Import routes after app creation to avoid circular imports  
from routes import *

# Create database tables
with app.app_context():
    db.create_all()
    logging.info("Database tables created successfully")
