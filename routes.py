from flask import render_template
from flask_login import current_user
from app import app
from api_routes import api

# Register API blueprint
app.register_blueprint(api)

# Catch-all route for React SPA (excluding admin routes)
@app.route('/')
def index():
    """Serve the React SPA for root route"""
    return render_template('spa.html')

# Alias for index route (for template compatibility)
@app.route('/index')
def spa_root():
    """Serve the React SPA for index route"""
    return render_template('spa.html')

@app.route('/<path:path>')
def spa(path=''):
    """Serve the React SPA for all routes except admin"""
    # Exclude admin routes from SPA catch-all
    if path.startswith('admin/'):
        from flask import abort
        abort(404)  # Let admin blueprint handle these routes
    
    # Serve the single-page application template
    return render_template('spa.html')

# Keep legacy routes for backward compatibility (if needed)
@app.route('/legacy/dashboard')
def legacy_dashboard():
    """Legacy dashboard route - redirects to React SPA"""
    from flask import redirect
    return redirect('/#/dashboard')

@app.route('/legacy/admin')
def legacy_admin():
    """Legacy admin route - redirects to React SPA"""
    from flask import redirect
    return redirect('/#/admin/dashboard')

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors by serving the React SPA (client-side routing will handle it)"""
    return render_template('spa.html')

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return render_template('spa.html')

# OAuth routes (if needed for social login)
@app.route('/auth/google')
def google_auth():
    """Handle Google OAuth"""
    # This would typically redirect to Google OAuth
    pass

@app.route('/auth/microsoft')
def microsoft_auth():
    """Handle Microsoft OAuth"""
    # This would typically redirect to Microsoft OAuth
    pass

@app.route('/auth/apple')
def apple_auth():
    """Handle Apple OAuth"""
    # This would typically redirect to Apple OAuth
    pass