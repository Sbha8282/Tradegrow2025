"""
OAuth configuration for social login providers
"""
from flask import redirect, url_for, flash, request, Blueprint
from flask_dance.contrib.google import make_google_blueprint
from flask_dance.consumer import oauth_authorized
from flask_dance.consumer.storage import BaseStorage
from flask_login import login_user, current_user
import os
import uuid

# In-memory storage for OAuth tokens to match the app's architecture
oauth_storage = {}

class MemoryStorage(BaseStorage):
    def get(self, blueprint):
        # Use session-based key for OAuth flow since user isn't logged in yet
        from flask import session
        session_key = session.get('_id', 'anonymous')
        key = f"{session_key}:{blueprint.name}"
        return oauth_storage.get(key)
    
    def set(self, blueprint, token):
        from flask import session
        session_key = session.get('_id', 'anonymous')
        key = f"{session_key}:{blueprint.name}"
        oauth_storage[key] = token
    
    def delete(self, blueprint):
        from flask import session
        session_key = session.get('_id', 'anonymous')
        key = f"{session_key}:{blueprint.name}"
        oauth_storage.pop(key, None)

# Create OAuth blueprints
def create_oauth_blueprints(app):
    """Create and configure OAuth blueprints"""
    
    # Google OAuth - only if credentials are available
    google_client_id = os.environ.get("GOOGLE_CLIENT_ID")
    google_client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
    google_oauth_enabled = bool(google_client_id and google_client_secret)
    
    google_bp = None
    if google_oauth_enabled:
        google_bp = make_google_blueprint(
            client_id=google_client_id,
            client_secret=google_client_secret,
            scope=["https://www.googleapis.com/auth/userinfo.email", 
                   "https://www.googleapis.com/auth/userinfo.profile", 
                   "openid"],
            storage=MemoryStorage()
        )
    
    # Microsoft OAuth - only if credentials are available
    microsoft_client_id = os.environ.get("MICROSOFT_CLIENT_ID")
    microsoft_client_secret = os.environ.get("MICROSOFT_CLIENT_SECRET")
    microsoft_oauth_enabled = bool(microsoft_client_id and microsoft_client_secret)
    
    microsoft_bp = None
    if microsoft_oauth_enabled:
        from flask_dance.consumer import OAuth2ConsumerBlueprint
        microsoft_bp = OAuth2ConsumerBlueprint(
            "microsoft", __name__,
            client_id=microsoft_client_id,
            client_secret=microsoft_client_secret,
            base_url="https://graph.microsoft.com/",
            token_url="https://login.microsoftonline.com/common/oauth2/v2.0/token",
            authorization_url="https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
            scope=["User.Read"],
            storage=MemoryStorage()
        )
    
    # Apple OAuth placeholder
    apple_bp = Blueprint("apple", __name__, url_prefix="/auth")
    
    @apple_bp.route("/apple")
    def apple_login():
        flash("Apple Sign-In is coming soon! Please use email/password login for now.", "info")
        return redirect('/')
    
    # Register blueprints only if they exist
    if google_bp:
        app.register_blueprint(google_bp, url_prefix="/auth")
    if microsoft_bp:
        app.register_blueprint(microsoft_bp, url_prefix="/auth") 
    app.register_blueprint(apple_bp)
    
    # Return blueprints (some might be None if credentials not configured)
    return google_bp, microsoft_bp, apple_bp

def setup_oauth_handlers(google_bp, microsoft_bp, apple_bp):
    """Set up OAuth authorization handlers"""
    
    # Only set up handlers for available blueprints
    if google_bp:
        @oauth_authorized.connect_via(google_bp)
        def google_logged_in(blueprint, token):
            if not token:
                flash("Failed to log in with Google.", "error")
                return redirect('/')
            
            try:
                resp = blueprint.session.get("/oauth2/v1/userinfo")
                if not resp.ok:
                    flash("Failed to fetch user info from Google.", "error")
                    return redirect('/')
                
                google_info = resp.json()
                create_or_update_user(
                    provider="google",
                    provider_user_id=str(google_info["id"]),
                    email=google_info.get("email"),
                    first_name=google_info.get("given_name"),
                    last_name=google_info.get("family_name"),
                    profile_image_url=google_info.get("picture")
                )
                return redirect('/')
            except Exception as e:
                flash(f"Google login error: {str(e)}", "error")
                return redirect('/')
    
    if microsoft_bp:
        @oauth_authorized.connect_via(microsoft_bp)
        def microsoft_logged_in(blueprint, token):
            if not token:
                flash("Failed to log in with Microsoft.", "error")
                return redirect('/')
            
            try:
                resp = blueprint.session.get("/v1.0/me")
                if not resp.ok:
                    flash("Failed to fetch user info from Microsoft.", "error")
                    return redirect('/')
                
                microsoft_info = resp.json()
                create_or_update_user(
                    provider="microsoft",
                    provider_user_id=str(microsoft_info["id"]),
                    email=microsoft_info.get("mail") or microsoft_info.get("userPrincipalName"),
                    first_name=microsoft_info.get("givenName"),
                    last_name=microsoft_info.get("surname"),
                    profile_image_url=None  # Microsoft Graph doesn't provide profile pic in basic scope
                )
                return redirect('/')
            except Exception as e:
                flash(f"Microsoft login error: {str(e)}", "error")
                return redirect('/')

def create_or_update_user(provider, provider_user_id, email, first_name=None, last_name=None, profile_image_url=None):
    """Create or update user from OAuth provider data"""
    from models import User
    from flask import flash
    
    # Check if user exists by email first
    user = User.get_by_email(email) if email else None
    
    if not user and email:
        # Create new user
        full_name = f"{first_name} {last_name}".strip() if first_name or last_name else None
        user = User(email=email, full_name=full_name or email.split('@')[0])
        user.save()
        flash(f"Successfully signed up with {provider.title()}!", "success")
    elif user:
        flash(f"Successfully logged in with {provider.title()}!", "success")
    else:
        flash("Failed to create user account.", "error")
        return False
    
    if user:
        login_user(user, remember=True)
    
    return True