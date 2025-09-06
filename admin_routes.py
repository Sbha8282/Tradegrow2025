"""
Admin routes for TradingGrow admin dashboard
"""
from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash
from functools import wraps
from datetime import datetime
from models import User, Watchlist, StockScreening, SubscriptionRequest
from data_service import MarketDataService
import json

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

def admin_required(f):
    """Decorator to require admin access"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            flash('Admin access required.', 'error')
            return redirect(url_for('admin.admin_login'))
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login page"""
    if request.method == 'POST':
        # Handle JSON API requests for React SPA
        if request.is_json:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
        else:
            # Handle form data for direct access
            email = request.form.get('email')
            password = request.form.get('password')
        
        if email and password:
            from models import User
            user = User.get_by_email(email)
            if user and user.is_admin and user.check_password(password):
                login_user(user, remember=True)  # Use remember=True for persistent sessions
                if request.is_json:
                    return jsonify({
                        'success': True, 
                        'message': 'Admin login successful',
                        'redirect': '/admin/dashboard'
                    })
                return redirect(url_for('admin.dashboard'))
            else:
                error_msg = 'Invalid admin credentials.'
                if request.is_json:
                    return jsonify({'success': False, 'error': error_msg}), 401
                flash(error_msg, 'error')
        else:
            error_msg = 'Please enter email and password.'
            if request.is_json:
                return jsonify({'success': False, 'error': error_msg}), 400
            flash(error_msg, 'error')
    
    # Serve React SPA for admin login
    return render_template('spa.html')

@admin_bp.route('/dashboard')
@admin_required
def dashboard():
    """Admin dashboard - serves React SPA with data"""
    from models import User, StockScreening, SubscriptionRequest
    from data_service import MarketDataService
    
    # Get user statistics
    all_users = User.get_all_users() or []
    total_users = len(all_users)
    admin_users = len([u for u in all_users if u.is_admin])
    regular_users = total_users - admin_users
    
    # Get subscription statistics
    free_users = len([u for u in all_users if u.subscription_tier == 'free'])
    medium_users = len([u for u in all_users if u.subscription_tier == 'medium'])
    pro_users = len([u for u in all_users if u.subscription_tier == 'pro'])
    
    # Get screening results and convert to dictionaries
    stock_screenings = StockScreening.get_all() or []
    screenings_data = []
    for screening in stock_screenings[:5]:  # Show latest 5
        screenings_data.append({
            'id': screening.id,
            'name': screening.name,
            'created_by': screening.created_by,
            'criteria': screening.criteria,
            'results': screening.results,
            'created_at': screening.created_at.isoformat(),
            'updated_at': screening.updated_at.isoformat()
        })
    
    # Get pending subscription requests
    pending_requests = SubscriptionRequest.get_pending() or []
    requests_data = []
    for request in pending_requests:
        user = User.get(request.user_id)
        requests_data.append({
            'id': request.id,
            'user_email': user.email if user else 'Unknown',
            'user_name': user.full_name if user else 'Unknown',
            'current_tier': request.current_tier,
            'requested_tier': request.requested_tier,
            'created_at': request.created_at.strftime('%Y-%m-%d %H:%M'),
            'status': request.status
        })
    
    stats = {
        'total_users': total_users,
        'admin_users': admin_users,
        'regular_users': regular_users,
        'free_users': free_users,
        'medium_users': medium_users,
        'pro_users': pro_users,
        'total_screenings': len(stock_screenings),
        'pending_requests': len(pending_requests)
    }
    
    # Serve React SPA with admin data embedded
    return render_template('spa.html', 
                         admin_data={
                             'stats': stats, 
                             'screenings': screenings_data,
                             'subscription_requests': requests_data
                         })

@admin_bp.route('/users')
@admin_required
def users():
    """User management page"""
    all_users = User.get_all_users()
    return render_template('admin/users.html', users=all_users)

@admin_bp.route('/users/<user_id>/subscription', methods=['POST'])
@admin_required
def update_user_subscription(user_id):
    """Update user subscription via API"""
    data = request.get_json()
    new_tier = data.get('tier')
    
    if not user_id or new_tier not in ['free', 'medium', 'pro']:
        return jsonify({'error': 'Invalid data'}), 400
    
    user = User.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.update_subscription(new_tier)
    return jsonify({'success': True, 'message': f'Updated {user.email} to {new_tier} tier'})

@admin_bp.route('/users/<user_id>/delete', methods=['POST'])
@admin_required
def delete_user(user_id):
    """Delete user via API"""
    
    user = User.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.is_admin:
        return jsonify({'error': 'Cannot delete admin users'}), 403
    
    # Delete user (cascades to watchlists)
    try:
        from app import db
        db.session.delete(user)
        db.session.commit()
        return jsonify({'success': True, 'message': f'Deleted user {user.email}'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/add-subscription', methods=['POST'])
@admin_required
def add_user_subscription(user_id):
    """Add subscription to user"""
    data = request.get_json()
    subscription_tier = data.get('tier', 'medium')
    
    user = User.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.update_subscription(subscription_tier)
    return jsonify({'success': True, 'message': f'Added {subscription_tier} subscription to {user.email}'})

@admin_bp.route('/users/<user_id>/remove-subscription', methods=['POST'])
@admin_required
def remove_user_subscription(user_id):
    """Remove user subscription (downgrade to free)"""
    user = User.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.update_subscription('free')
    return jsonify({'success': True, 'message': f'Removed subscription from {user.email} (now free tier)'})

@admin_bp.route('/stocks/update', methods=['POST'])
@admin_required
def update_stocks():
    """Update stock data for all users"""
    try:
        from data_service import MarketDataService
        
        # Get all user watchlists
        all_watchlists = Watchlist.query.all()
        updated_count = 0
        
        for watchlist in all_watchlists:
            stocks = watchlist.stocks
            updated_stocks = []
            
            for stock in stocks:
                # Get fresh stock data
                fresh_data = MarketDataService.get_stock_data(stock.get('symbol'))
                if fresh_data:
                    # Keep existing buy_point if it exists
                    fresh_data['buy_point'] = stock.get('buy_point', fresh_data.get('buy_point'))
                    updated_stocks.append(fresh_data)
                else:
                    updated_stocks.append(stock)  # Keep old data if fresh data unavailable
            
            watchlist.stocks = updated_stocks
            watchlist.save()
            updated_count += 1
        
        return jsonify({
            'success': True, 
            'message': f'Updated stocks in {updated_count} watchlists',
            'updated_watchlists': updated_count
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/watchlists/user/<user_id>', methods=['GET'])
@admin_required
def get_user_watchlists(user_id):
    """Get watchlists for a specific user"""
    user = User.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    watchlists = Watchlist.get_by_user(user_id)
    watchlists_data = []
    
    for watchlist in watchlists:
        watchlists_data.append({
            'id': watchlist.id,
            'name': watchlist.name,
            'type': watchlist.watchlist_type,
            'stocks': watchlist.stocks,
            'stock_count': len(watchlist.stocks),
            'created_at': watchlist.created_at.isoformat(),
            'updated_at': watchlist.updated_at.isoformat()
        })
    
    return jsonify({
        'success': True,
        'user': {'email': user.email, 'full_name': user.full_name},
        'watchlists': watchlists_data
    })

@admin_bp.route('/watchlists/<watchlist_id>/add-stock', methods=['POST'])
@admin_required
def add_stock_to_watchlist(watchlist_id):
    """Add stock to a watchlist"""
    data = request.get_json()
    symbol = data.get('symbol')
    
    if not symbol:
        return jsonify({'error': 'Stock symbol is required'}), 400
    
    watchlist = Watchlist.get(watchlist_id)
    if not watchlist:
        return jsonify({'error': 'Watchlist not found'}), 404
    
    # Get stock data
    from data_service import MarketDataService
    stock_data = MarketDataService.get_stock_data(symbol.upper())
    
    if not stock_data:
        return jsonify({'error': f'Could not find data for {symbol}'}), 400
    
    # Check if stock already exists
    existing_stocks = watchlist.stocks
    for stock in existing_stocks:
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

@admin_bp.route('/watchlists/<watchlist_id>/remove-stock', methods=['POST'])
@admin_required
def remove_stock_from_watchlist(watchlist_id):
    """Remove stock from a watchlist"""
    data = request.get_json()
    symbol = data.get('symbol')
    
    if not symbol:
        return jsonify({'error': 'Stock symbol is required'}), 400
    
    watchlist = Watchlist.get(watchlist_id)
    if not watchlist:
        return jsonify({'error': 'Watchlist not found'}), 404
    
    # Remove stock
    watchlist.remove_stock(symbol.upper())
    watchlist.save()
    
    return jsonify({
        'success': True,
        'message': f'Removed {symbol.upper()} from {watchlist.name}'
    })

@admin_bp.route('/stock-screening')
@admin_required
def stock_screening():
    """Stock screening management"""
    screenings = StockScreening.get_all()
    return render_template('admin/stock_screening.html', screenings=screenings)

@admin_bp.route('/stock-screening/create', methods=['POST'])
@admin_required
def create_screening():
    """Create new stock screening"""
    data = request.get_json()
    name = data.get('name')
    criteria = data.get('criteria', {})
    
    if not name:
        return jsonify({'error': 'Screening name is required'}), 400
    
    # Generate mock screening results based on criteria
    mock_results = generate_mock_screening_results(criteria)
    
    screening = StockScreening(
        name=name,
        criteria=criteria,
        results=mock_results,
        created_by=current_user.id
    )
    
    try:
        screening.save()
        return jsonify({'success': True, 'screening_id': screening.id})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/stock-screening/<screening_id>/update', methods=['POST'])
@admin_required
def update_screening(screening_id):
    """Update stock screening results"""
    screening = StockScreening.get(screening_id)
    if not screening:
        return jsonify({'error': 'Screening not found'}), 404
    
    # Regenerate results based on current criteria
    new_results = generate_mock_screening_results(screening.criteria_data)
    screening.results = json.dumps(new_results)
    screening.updated_at = datetime.utcnow()
    
    try:
        screening.save()
        return jsonify({'success': True, 'results': new_results})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/stock-screening/<screening_id>/delete', methods=['POST'])
@admin_required
def delete_screening(screening_id):
    """Delete stock screening"""
    screening = StockScreening.get(screening_id)
    if not screening:
        return jsonify({'error': 'Screening not found'}), 404
    
    try:
        screening.delete()
        return jsonify({'success': True, 'message': f'Deleted screening {screening.name}'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/api/dashboard-data')
@admin_required
def api_dashboard_data():
    """API endpoint for React dashboard data"""
    sector_data = MarketDataService.get_sector_data()
    
    # Get user statistics
    all_users = User.get_all_users()
    stats = {
        'total_users': len(all_users),
        'admin_users': len([u for u in all_users if u.is_admin]),
        'free_users': len([u for u in all_users if u.subscription_tier == 'free']),
        'medium_users': len([u for u in all_users if u.subscription_tier == 'medium']),
        'pro_users': len([u for u in all_users if u.subscription_tier == 'pro']),
        'total_screenings': len(StockScreening.get_all())
    }
    
    return jsonify({
        'success': True,
        'data': {
            'stats': stats,
            'sector_data': sector_data,
            'screenings': [
                {
                    'id': s.id,
                    'name': s.name,
                    'created_at': s.created_at.isoformat(),
                    'results_count': len(s.results_data.get('stocks', []))
                } for s in StockScreening.get_all()[:10]
            ]
        }
    })

def generate_mock_screening_results(criteria):
    """Generate mock stock screening results based on criteria"""
    from random import randint, uniform, choice
    
    # Mock stock symbols
    symbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX', 
               'AMD', 'CRM', 'ORCL', 'IBM', 'INTC', 'CSCO', 'ADBE']
    
    results = []
    num_results = randint(5, min(len(symbols), 12))
    selected_symbols = choice(symbols[:num_results])
    
    for symbol in selected_symbols:
        results.append({
            'symbol': symbol,
            'price': round(uniform(50, 500), 2),
            'change_percent': round(uniform(-5, 8), 2),
            'volume': randint(1000000, 50000000),
            'market_cap': f"${randint(100, 2000)}B",
            'pe_ratio': round(uniform(10, 35), 1),
            'score': randint(60, 95)
        })
    
    return {
        'stocks': results,
        'total_found': len(results),
        'criteria_matched': len(criteria),
        'generated_at': datetime.utcnow().isoformat()
    }

@admin_bp.route('/api/users')
@admin_required
def api_users():
    """API endpoint for user management"""
    all_users = User.get_all_users()
    users_data = []
    for user in all_users:
        users_data.append({
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'subscription_tier': user.subscription_tier,
            'is_admin': user.is_admin,
            'created_at': user.created_at.isoformat(),
            'updated_at': user.updated_at.isoformat()
        })
    
    return jsonify({'success': True, 'users': users_data})

@admin_bp.route('/api/stock-screenings')
@admin_required 
def api_stock_screenings():
    """API endpoint for stock screenings"""
    screenings = StockScreening.get_all()
    screenings_data = []
    for screening in screenings:
        screenings_data.append({
            'id': screening.id,
            'name': screening.name,
            'criteria_data': screening.criteria_data,
            'results_data': screening.results_data,
            'created_at': screening.created_at.isoformat(),
            'updated_at': screening.updated_at.isoformat()
        })
    
    return jsonify({'success': True, 'screenings': screenings_data})

@admin_bp.route('/subscription-requests/<request_id>/approve', methods=['POST'])
@admin_required
def approve_subscription_request(request_id):
    """Approve a subscription request"""
    request = SubscriptionRequest.query.get(request_id)
    if not request:
        return jsonify({'error': 'Request not found'}), 404
    
    if request.status != 'pending':
        return jsonify({'error': 'Request already processed'}), 400
    
    request.approve()
    user = User.get(request.user_id)
    
    return jsonify({
        'success': True,
        'message': f'Approved {user.email}\'s upgrade to {request.requested_tier}'
    })

@admin_bp.route('/subscription-requests/<request_id>/reject', methods=['POST'])
@admin_required
def reject_subscription_request(request_id):
    """Reject a subscription request"""
    request = SubscriptionRequest.query.get(request_id)
    if not request:
        return jsonify({'error': 'Request not found'}), 404
    
    if request.status != 'pending':
        return jsonify({'error': 'Request already processed'}), 400
    
    request.reject()
    user = User.get(request.user_id)
    
    return jsonify({
        'success': True,
        'message': f'Rejected {user.email}\'s upgrade request'
    })

@admin_bp.route('/logout')
@admin_required
def logout():
    """Admin logout"""
    logout_user()
    return redirect(url_for('admin.admin_login'))