from flask import render_template, request, redirect, url_for, flash, jsonify, session
from flask_login import login_user, logout_user, login_required, current_user
from data_service import MarketDataService
import stripe
import os
import uuid

# Import app and models after to avoid circular imports
from app import app

# Configure Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Initialize session for OAuth
@app.before_request
def init_session():
    if '_id' not in session:
        session['_id'] = str(uuid.uuid4())
    session.permanent = True

@app.route('/')
def index():
    """Redirect to dashboard if logged in, otherwise to login"""
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    """Main dashboard - redirect based on user type"""
    from models import User, Watchlist, StockScreening
    
    if current_user.is_admin:
        return redirect(url_for('admin.dashboard'))
    
    # Regular user dashboard with React components
    sector_data = MarketDataService.get_sector_data()
    
    # Get user's watchlists
    breakout_watchlists = Watchlist.get_by_user_and_type(current_user.id, 'breakout')
    speculative_watchlists = Watchlist.get_by_user_and_type(current_user.id, 'speculative')
    normal_watchlists = Watchlist.get_by_user_and_type(current_user.id, 'normal')
    
    # If user has no watchlists, create default ones
    if not (breakout_watchlists or speculative_watchlists or normal_watchlists):
        default_data = MarketDataService.get_default_watchlist_data()
        
        # Create default watchlists
        breakout_wl = Watchlist('Breakout Watchlist', current_user.id, 'breakout')
        speculative_wl = Watchlist('Speculative Watchlist', current_user.id, 'speculative')
        normal_wl = Watchlist('Normal Watchlist', current_user.id, 'normal')
        
        # Add default stocks
        for stock in default_data['breakout']:
            stock_data = MarketDataService.get_stock_data(stock['symbol'])
            if stock_data:
                stock_data['buy_point'] = stock['buy_point']
                breakout_wl.add_stock(stock_data)
        
        for stock in default_data['speculative']:
            stock_data = MarketDataService.get_stock_data(stock['symbol'])
            if stock_data:
                stock_data['buy_point'] = stock['buy_point']
                speculative_wl.add_stock(stock_data)
        
        for stock in default_data['normal']:
            stock_data = MarketDataService.get_stock_data(stock['symbol'])
            if stock_data:
                stock_data['buy_point'] = stock['buy_point']
                normal_wl.add_stock(stock_data)
        
        # Save watchlists
        breakout_wl.save()
        speculative_wl.save()
        normal_wl.save()
        
        breakout_watchlists = [breakout_wl]
        speculative_watchlists = [speculative_wl]
        normal_watchlists = [normal_wl]
    
    # Convert watchlists to dictionaries for JSON serialization
    all_watchlists = breakout_watchlists + speculative_watchlists + normal_watchlists
    watchlists_data = []
    for watchlist in all_watchlists:
        watchlists_data.append({
            'id': watchlist.id,
            'name': watchlist.name,
            'type': watchlist.watchlist_type,
            'stocks': watchlist.stocks,
            'created_at': watchlist.created_at.isoformat(),
            'updated_at': watchlist.updated_at.isoformat()
        })
    
    # Convert user to dictionary
    user_data = {
        'id': current_user.id,
        'email': current_user.email,
        'full_name': current_user.full_name,
        'subscription_tier': current_user.subscription_tier,
        'is_admin': current_user.is_admin
    }
    
    # Use React-based user dashboard
    return render_template('user_dashboard.html', 
                         sector_data=sector_data,
                         watchlists=watchlists_data,
                         user=user_data)

@app.route('/watchlist')
@login_required
def watchlist():
    """Watchlist management page"""
    # Get user's watchlists
    breakout_watchlists = Watchlist.get_by_user_and_type(current_user.id, 'breakout')
    speculative_watchlists = Watchlist.get_by_user_and_type(current_user.id, 'speculative')
    normal_watchlists = Watchlist.get_by_user_and_type(current_user.id, 'normal')
    
    # If user has no watchlists, create default ones
    if not (breakout_watchlists or speculative_watchlists or normal_watchlists):
        default_data = MarketDataService.get_default_watchlist_data()
        
        # Create default watchlists
        breakout_wl = Watchlist('Breakout Watchlist', current_user.id, 'breakout')
        speculative_wl = Watchlist('Speculative Watchlist', current_user.id, 'speculative')
        normal_wl = Watchlist('Normal Watchlist', current_user.id, 'normal')
        
        # Add default stocks
        for stock in default_data['breakout']:
            stock_data = MarketDataService.get_stock_data(stock['symbol'])
            if stock_data:
                stock_data['buy_point'] = stock['buy_point']
                breakout_wl.add_stock(stock_data)
        
        for stock in default_data['speculative']:
            stock_data = MarketDataService.get_stock_data(stock['symbol'])
            if stock_data:
                stock_data['buy_point'] = stock['buy_point']
                speculative_wl.add_stock(stock_data)
        
        for stock in default_data['normal']:
            stock_data = MarketDataService.get_stock_data(stock['symbol'])
            if stock_data:
                stock_data['buy_point'] = stock['buy_point']
                normal_wl.add_stock(stock_data)
        
        # Save watchlists
        breakout_wl.save()
        speculative_wl.save()
        normal_wl.save()
        
        breakout_watchlists = [breakout_wl]
        speculative_watchlists = [speculative_wl]
        normal_watchlists = [normal_wl]
    
    return render_template('watchlist.html', 
                         breakout_watchlists=breakout_watchlists,
                         speculative_watchlists=speculative_watchlists,
                         normal_watchlists=normal_watchlists)

@app.route('/invitation')
@login_required
def invitation():
    """Invitation/onboarding page"""
    return render_template('invitation.html')

@app.route('/subscription')
@login_required
def subscription():
    """Subscription management page"""
    return render_template('subscription.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """User login"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not email or not password:
            flash('Please provide both email and password.', 'error')
            return render_template('login.html')
        
        user = User.get_by_email(email)
        if user and user.check_password(password):
            login_user(user, remember=True)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('invitation'))
        else:
            flash('Invalid email or password.', 'error')
    
    return render_template('login.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    """User registration"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if not email or not password:
            flash('Please provide both email and password.', 'error')
            return render_template('signup.html')
        
        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return render_template('signup.html')
        
        if User.get_by_email(email):
            flash('An account with this email already exists.', 'error')
            return render_template('signup.html')
        
        # Create new user
        user = User(email=email, password=password)
        user.save()
        
        login_user(user, remember=True)
        flash('Account created successfully!', 'success')
        return redirect(url_for('invitation'))
    
    return render_template('signup.html')

@app.route('/logout')
@login_required
def logout():
    """User logout"""
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))


@app.route('/payment-success')
@login_required
def payment_success():
    """Handle successful payment"""
    session_id = request.args.get('session_id')
    
    try:
        # Retrieve the session to get payment details
        if session_id:
            stripe_session = stripe.checkout.Session.retrieve(session_id)
            
            # Update user subscription in database
            plan = stripe_session.metadata.get('plan', 'free') if stripe_session.metadata else 'free'
            current_user.subscription_tier = plan
            current_user.save()
            
            flash(f'Payment successful! You are now subscribed to the {plan.title()} plan.', 'success')
        else:
            flash('Payment completed successfully!', 'success')
            
    except Exception as e:
        app.logger.error(f'Payment success handling error: {str(e)}')
        flash('Payment was successful, but there was an issue updating your account. Please contact support.', 'warning')
    
    return redirect(url_for('dashboard'))

# OAuth callback route to redirect to invitation page
@app.route('/oauth/callback')
def oauth_callback():
    """General OAuth callback handler"""
    return redirect(url_for('invitation'))

# Stripe payment routes for subscriptions
@app.route('/create-checkout-session', methods=['POST'])
@login_required
def create_checkout_session():
    """Create Stripe checkout session for subscription payment"""
    import stripe
    import os
    
    stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
    
    try:
        # Get selected plan from form
        plan = request.form.get('plan', 'free')
        
        # Define plan configurations
        plans = {
            'free': {
                'name': 'LogoCrypto Free Plan',
                'description': '3 months free trial, then $160/month',
                'unit_amount': 0,  # Free for first 3 months
                'interval': 'month'
            },
            'medium': {
                'name': 'LogoCrypto Medium Plan', 
                'description': '$10 for 3 months',
                'unit_amount': 1000,  # $10.00 for 3 months
                'interval': 'month'
            },
            'pro': {
                'name': 'LogoCrypto Pro Plan',
                'description': '$80 for 6 months', 
                'unit_amount': 8000,  # $80.00 for 6 months
                'interval': 'month'
            }
        }
        
        selected_plan = plans.get(plan, plans['free'])
        
        # Get domain for URLs
        domain = request.url_root.rstrip('/')
        
        # Handle free plan differently (no payment required)
        if plan == 'free':
            current_user.subscription_tier = 'free'
            current_user.save()
            flash('Free plan activated! Enjoy 3 months of full features.', 'success')
            return redirect(url_for('dashboard'))
        
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': selected_plan['name'],
                            'description': selected_plan['description']
                        },
                        'recurring': {
                            'interval': selected_plan['interval'],
                        },
                        'unit_amount': selected_plan['unit_amount'],
                    },
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=domain + f'/subscription-success?session_id={{CHECKOUT_SESSION_ID}}&plan={plan}',
            cancel_url=domain + '/subscription',
            customer_email=current_user.email,
            metadata={
                'user_id': current_user.id,
                'plan': plan
            }
        )
        return redirect(checkout_session.url or url_for('subscription'), code=303)
    except Exception as e:
        flash(f'Error creating checkout session: {str(e)}', 'error')
        return redirect(url_for('subscription'))

@app.route('/subscription-success')
@login_required
def subscription_success():
    """Handle successful subscription payment"""
    session_id = request.args.get('session_id')
    plan = request.args.get('plan', 'free')
    
    plan_names = {
        'free': 'Free',
        'medium': 'Medium', 
        'pro': 'Pro'
    }
    
    if session_id:
        # Here you would typically verify the session with Stripe and update user subscription
        plan_name = plan_names.get(plan, 'Pro')
        flash(f'Subscription activated successfully! Welcome to LogoCrypto {plan_name}!', 'success')
    else:
        flash('Subscription confirmation failed. Please contact support.', 'error')
    
    return redirect(url_for('dashboard'))

@app.route('/api/sector-data')
@login_required
def api_sector_data():
    """API endpoint for sector data"""
    sector = request.args.get('sector')
    if sector:
        sector_data = MarketDataService.get_sector_data()
        if sector in sector_data:
            return jsonify(sector_data[sector])
        return jsonify({'error': 'Sector not found'}), 404
    
    return jsonify(MarketDataService.get_sector_data())

# API Routes for User Dashboard
@app.route('/api/user/data')
@login_required
def get_user_data():
    """Get current user data for real-time updates"""
    from models import User, Watchlist, StockScreening
    
    user_watchlists = Watchlist.get_by_user(current_user.id)
    
    # Convert watchlists to dictionaries
    watchlists_data = []
    for watchlist in user_watchlists:
        watchlists_data.append({
            'id': watchlist.id,
            'name': watchlist.name,
            'type': watchlist.watchlist_type,
            'stocks': watchlist.stocks,
            'created_at': watchlist.created_at.isoformat(),
            'updated_at': watchlist.updated_at.isoformat()
        })
    
    # Convert user to dictionary
    user_data = {
        'id': current_user.id,
        'email': current_user.email,
        'full_name': current_user.full_name,
        'subscription_tier': current_user.subscription_tier,
        'is_admin': current_user.is_admin
    }
    
    return jsonify({
        'success': True,
        'user': user_data,
        'watchlists': watchlists_data
    })

@app.route('/api/watchlist/<watchlist_id>/add-stock', methods=['POST'])
@login_required
def add_stock_to_user_watchlist(watchlist_id):
    """Add stock to user's watchlist"""
    from models import User, Watchlist, StockScreening
    
    data = request.get_json()
    symbol = data.get('symbol')
    
    if not symbol:
        return jsonify({'error': 'Stock symbol is required'}), 400
    
    watchlist = Watchlist.get(watchlist_id)
    if not watchlist:
        return jsonify({'error': 'Watchlist not found'}), 404
    
    # Verify watchlist belongs to current user
    if watchlist.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Get stock data
    stock_data = MarketDataService.get_stock_data(symbol.upper())
    if not stock_data:
        return jsonify({'error': f'Could not find data for {symbol}'}), 400
    
    # Check if stock already exists
    for stock in watchlist.stocks:
        if stock.get('symbol') == symbol.upper():
            return jsonify({'error': f'{symbol} already exists in this watchlist'}), 400
    
    # Add stock
    watchlist.add_stock(stock_data)
    watchlist.save()
    
    return jsonify({
        'success': True,
        'message': f'Added {symbol.upper()} to {watchlist.name}',
        'stock': stock_data
    })

@app.route('/api/watchlist/<watchlist_id>/remove-stock', methods=['POST'])
@login_required
def remove_stock_from_user_watchlist(watchlist_id):
    """Remove stock from user's watchlist"""
    from models import User, Watchlist, StockScreening
    
    data = request.get_json()
    symbol = data.get('symbol')
    
    if not symbol:
        return jsonify({'error': 'Stock symbol is required'}), 400
    
    watchlist = Watchlist.get(watchlist_id)
    if not watchlist:
        return jsonify({'error': 'Watchlist not found'}), 404
    
    # Verify watchlist belongs to current user
    if watchlist.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    # Remove stock
    watchlist.remove_stock(symbol.upper())
    watchlist.save()
    
    return jsonify({
        'success': True,
        'message': f'Removed {symbol.upper()} from {watchlist.name}'
    })

@app.route('/api/user/request-subscription', methods=['POST'])
@login_required
def request_subscription_upgrade():
    """Submit subscription upgrade request"""
    from models import SubscriptionRequest
    from flask import request as flask_request
    
    data = flask_request.get_json()
    tier = data.get('tier')
    
    if tier not in ['medium', 'pro']:
        return jsonify({'error': 'Invalid subscription tier'}), 400
    
    if current_user.subscription_tier == tier:
        return jsonify({'error': f'You already have the {tier} plan'}), 400
    
    # Check for existing pending request
    existing_requests = SubscriptionRequest.get_by_user(current_user.id)
    pending_request = [r for r in existing_requests if r.status == 'pending']
    
    if pending_request:
        return jsonify({'error': 'You already have a pending subscription request'}), 400
    
    # Create subscription request
    subscription_request = SubscriptionRequest(
        user_id=current_user.id,
        requested_tier=tier,
        current_tier=current_user.subscription_tier
    )
    subscription_request.save()
    
    return jsonify({
        'success': True,
        'message': f'Subscription request for {tier} submitted successfully!'
    })

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500
