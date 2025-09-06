from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import uuid
import json


def init_models(db):
    """Initialize models with database instance"""
    
    class User(UserMixin, db.Model):
        __tablename__ = 'users'
        
        id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
        email = db.Column(db.String(120), unique=True, nullable=False)
        full_name = db.Column(db.String(100), nullable=True)
        password_hash = db.Column(db.String(256), nullable=True)
        subscription_tier = db.Column(db.String(20), default='free')
        is_admin = db.Column(db.Boolean, default=False)  # Admin flag
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        # Relationship to watchlists
        watchlists = db.relationship('Watchlist', backref='user', lazy=True, cascade='all, delete-orphan')

        def __init__(self, email, password=None, full_name=None, is_admin=False, **kwargs):
            super().__init__(**kwargs)
            self.email = email
            self.full_name = full_name or email.split('@')[0]
            if password:
                self.password_hash = generate_password_hash(password)
            self.subscription_tier = 'free'
            self.is_admin = is_admin

        def check_password(self, password):
            if self.password_hash is None:
                return False
            return check_password_hash(self.password_hash, password)

        def save(self):
            try:
                db.session.add(self)
                db.session.commit()
                return self
            except Exception as e:
                db.session.rollback()
                raise e

        @staticmethod
        def get(user_id):
            return User.query.filter_by(id=user_id).first()

        @staticmethod
        def get_by_email(email):
            return User.query.filter_by(email=email).first()
        
        @staticmethod
        def get_all_users():
            """Get all users for admin management"""
            return User.query.all()
        
        @staticmethod
        def create_admin(email, password, full_name=None):
            """Create an admin user"""
            admin_user = User(email=email, password=password, full_name=full_name, is_admin=True)
            return admin_user.save()
        
        def update_subscription(self, new_tier):
            """Update user's subscription tier"""
            self.subscription_tier = new_tier
            self.updated_at = datetime.utcnow()
            return self.save()

        def get_id(self):
            return self.id
        
        @property
        def is_active(self):
            return True

        def __repr__(self):
            return f'<User {self.email}>'


    class Watchlist(db.Model):
        __tablename__ = 'watchlists'
        
        id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
        name = db.Column(db.String(100), nullable=False)
        user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
        watchlist_type = db.Column(db.String(20), default='normal')  # 'breakout', 'speculative', 'normal'
        stocks_json = db.Column(db.Text, default='[]')  # JSON string to store stocks data
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

        def __init__(self, name, user_id, watchlist_type='normal', **kwargs):
            super().__init__(**kwargs)
            self.name = name
            self.user_id = user_id
            self.watchlist_type = watchlist_type
            self.stocks_json = '[]'

        @property
        def stocks(self):
            """Get stocks as a list from JSON string"""
            try:
                return json.loads(self.stocks_json or '[]')
            except (json.JSONDecodeError, TypeError):
                return []

        @stocks.setter
        def stocks(self, value):
            """Set stocks as JSON string from list"""
            self.stocks_json = json.dumps(value or [])

        def add_stock(self, stock_data):
            """Add a stock to the watchlist"""
            current_stocks = self.stocks
            current_stocks.append(stock_data)
            self.stocks = current_stocks
            self.updated_at = datetime.utcnow()

        def remove_stock(self, symbol):
            """Remove a stock from the watchlist by symbol"""
            current_stocks = self.stocks
            current_stocks = [stock for stock in current_stocks if stock.get('symbol') != symbol]
            self.stocks = current_stocks
            self.updated_at = datetime.utcnow()

        def save(self):
            try:
                db.session.add(self)
                db.session.commit()
                return self
            except Exception as e:
                db.session.rollback()
                raise e

        @staticmethod
        def get(watchlist_id):
            return Watchlist.query.filter_by(id=watchlist_id).first()

        @staticmethod
        def get_by_user(user_id):
            return Watchlist.query.filter_by(user_id=user_id).all()

        @staticmethod
        def get_by_user_and_type(user_id, watchlist_type):
            return Watchlist.query.filter_by(user_id=user_id, watchlist_type=watchlist_type).all()

        def __repr__(self):
            return f'<Watchlist {self.name} ({self.watchlist_type})>'
    
    
    class SubscriptionRequest(db.Model):
        __tablename__ = 'subscription_requests'
        
        id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
        user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
        requested_tier = db.Column(db.String(20), nullable=False)  # 'medium' or 'pro'
        current_tier = db.Column(db.String(20), nullable=False)   # current tier when request made
        status = db.Column(db.String(20), default='pending')      # 'pending', 'approved', 'rejected'
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        # Relationship to user
        user = db.relationship('User', backref='subscription_requests')
        
        def __init__(self, user_id, requested_tier, current_tier, **kwargs):
            super().__init__(**kwargs)
            self.user_id = user_id
            self.requested_tier = requested_tier
            self.current_tier = current_tier
            self.status = 'pending'

        def save(self):
            try:
                db.session.add(self)
                db.session.commit()
                return self
            except Exception as e:
                db.session.rollback()
                raise e
        
        @staticmethod
        def get_all():
            return SubscriptionRequest.query.order_by(SubscriptionRequest.created_at.desc()).all()
        
        @staticmethod
        def get_pending():
            return SubscriptionRequest.query.filter_by(status='pending').order_by(SubscriptionRequest.created_at.desc()).all()
        
        @staticmethod
        def get_by_user(user_id):
            return SubscriptionRequest.query.filter_by(user_id=user_id).order_by(SubscriptionRequest.created_at.desc()).all()
        
        def approve(self):
            """Approve the subscription request and update user tier"""
            self.status = 'approved'
            self.updated_at = datetime.utcnow()
            user = User.get(self.user_id)
            if user:
                user.update_subscription(self.requested_tier)
            return self.save()
        
        def reject(self):
            """Reject the subscription request"""
            self.status = 'rejected'
            self.updated_at = datetime.utcnow()
            return self.save()
        
        def __repr__(self):
            return f'<SubscriptionRequest {self.user_id} -> {self.requested_tier}>'

    
    class StockScreening(db.Model):
        __tablename__ = 'stock_screenings'
        
        id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
        name = db.Column(db.String(100), nullable=False)
        criteria = db.Column(db.Text, nullable=False)  # JSON string for screening criteria
        results = db.Column(db.Text, nullable=False)   # JSON string for screening results
        created_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        def __init__(self, name, criteria, results, created_by, **kwargs):
            super().__init__(**kwargs)
            self.name = name
            self.criteria = json.dumps(criteria) if isinstance(criteria, dict) else criteria
            self.results = json.dumps(results) if isinstance(results, dict) else results
            self.created_by = created_by
        
        @property
        def criteria_data(self):
            """Get criteria as dict from JSON string"""
            try:
                return json.loads(self.criteria or '{}')
            except (json.JSONDecodeError, TypeError):
                return {}
        
        @property
        def results_data(self):
            """Get results as dict from JSON string"""
            try:
                return json.loads(self.results or '{}')
            except (json.JSONDecodeError, TypeError):
                return {}
        
        def save(self):
            try:
                db.session.add(self)
                db.session.commit()
                return self
            except Exception as e:
                db.session.rollback()
                raise e
        
        @staticmethod
        def get_all():
            return StockScreening.query.order_by(StockScreening.created_at.desc()).all()
        
        @staticmethod
        def get(screening_id):
            return StockScreening.query.filter_by(id=screening_id).first()
        
        def delete(self):
            try:
                db.session.delete(self)
                db.session.commit()
                return True
            except Exception as e:
                db.session.rollback()
                raise e
        
        def __repr__(self):
            return f'<StockScreening {self.name}>'

    return User, Watchlist, StockScreening, SubscriptionRequest


# Placeholder for models - will be set by init_models()
User = None
Watchlist = None
StockScreening = None
SubscriptionRequest = None