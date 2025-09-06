import random
from datetime import datetime, timedelta

class MarketDataService:
    """Service to generate mock financial data for the platform"""
    
    SECTORS = {
        'Technology': ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
        'Healthcare': ['JNJ', 'PFE', 'UNH', 'ABBV', 'BMY'],
        'Financials': ['JPM', 'BAC', 'WFC', 'GS', 'MS'],
        'Energy': ['XOM', 'CVX', 'COP', 'EOG', 'SLB'],
        'Materials': ['LIN', 'APD', 'FCX', 'NEM', 'DOW'],
        'Wholesale Distributors': ['HD', 'LOW', 'TGT', 'WMT', 'COST'],
        'Tobacco': ['MO', 'PM', 'BTI', 'UVV', 'TPG']
    }
    
    COMPANY_NAMES = {
        'AAPL': 'Apple Inc.',
        'MSFT': 'Microsoft Corp.',
        'GOOGL': 'Alphabet Inc.',
        'META': 'Meta Platforms',
        'NVDA': 'NVIDIA Corp.',
        'JNJ': 'Johnson & Johnson',
        'PFE': 'Pfizer Inc.',
        'UNH': 'UnitedHealth Group',
        'ABBV': 'AbbVie Inc.',
        'BMY': 'Bristol Myers Squibb',
        'JPM': 'JPMorgan Chase',
        'BAC': 'Bank of America',
        'WFC': 'Wells Fargo',
        'GS': 'Goldman Sachs',
        'MS': 'Morgan Stanley',
        'XOM': 'Exxon Mobil',
        'CVX': 'Chevron Corp.',
        'COP': 'ConocoPhillips',
        'EOG': 'EOG Resources',
        'SLB': 'Schlumberger',
        'LIN': 'Linde plc',
        'APD': 'Air Products',
        'FCX': 'Freeport McMoRan',
        'NEM': 'Newmont Corp.',
        'DOW': 'Dow Inc.',
        'HD': 'Home Depot',
        'LOW': 'Lowe\'s Companies',
        'TGT': 'Target Corp.',
        'WMT': 'Walmart Inc.',
        'COST': 'Costco Wholesale',
        'MO': 'Altria Group',
        'PM': 'Philip Morris',
        'BTI': 'British American Tobacco',
        'UVV': 'Universal Corp.',
        'TPG': 'TPG Inc.'
    }

    @staticmethod
    def generate_time_series_data(days=365, start_price=100.0):
        """Generate time series data for a stock or sector"""
        data = []
        current_price = start_price
        start_date = datetime.now() - timedelta(days=days)
        
        for i in range(days):
            date = start_date + timedelta(days=i)
            # Add some realistic price movement
            change_percent = random.uniform(-0.05, 0.05)  # -5% to +5% daily change
            current_price *= (1 + change_percent)
            
            data.append({
                'date': date.strftime('%Y-%m-%d'),
                'price': round(current_price, 2),
                'volume': random.randint(1000000, 50000000)
            })
        
        return data

    @staticmethod
    def get_sector_data():
        """Get sector performance data"""
        sector_data = {}
        
        for sector in MarketDataService.SECTORS.keys():
            # Generate sector index data
            sector_data[sector] = {
                'name': sector,
                'current_value': round(random.uniform(80, 200), 2),
                'change_percent': round(random.uniform(-3, 3), 2),
                'time_series': MarketDataService.generate_time_series_data(365, random.uniform(80.0, 120.0))
            }
        
        return sector_data

    @staticmethod
    def get_stock_data(symbol):
        """Get individual stock data"""
        if symbol not in MarketDataService.COMPANY_NAMES:
            return None
        
        # Get sector for the stock
        sector = None
        for sec, stocks in MarketDataService.SECTORS.items():
            if symbol in stocks:
                sector = sec
                break
        
        # Determine market cap category based on price
        price = round(random.uniform(10, 500), 2)
        if price > 200:
            market_cap = 'Large Cap'
        elif price > 50:
            market_cap = 'Mid Cap'
        else:
            market_cap = 'Small Cap'
        
        return {
            'symbol': symbol,
            'company_name': MarketDataService.COMPANY_NAMES[symbol],
            'sector': sector,
            'price': price,
            'change_percent': round(random.uniform(-5, 5), 2),
            'volume': random.randint(100000, 10000000),
            'market_cap_category': market_cap,
            'country': 'USA'
        }

    @staticmethod
    def get_watchlist_stocks(symbols):
        """Get stock data for a list of symbols"""
        stocks = []
        for symbol in symbols:
            stock_data = MarketDataService.get_stock_data(symbol)
            if stock_data:
                # Add buy point for watchlist display
                stock_data['buy_point'] = round(stock_data['price'] * random.uniform(0.9, 1.1), 2)
                stocks.append(stock_data)
        return stocks

    @staticmethod
    def get_default_watchlist_data():
        """Get default watchlist data for new users"""
        return {
            'breakout': [
                {'symbol': 'AAPL', 'buy_point': 180.00},
                {'symbol': 'PFE', 'buy_point': 34.00},
                {'symbol': 'JPM', 'buy_point': 200.00},
                {'symbol': 'CVX', 'buy_point': 160.00}
            ],
            'speculative': [
                {'symbol': 'META', 'buy_point': 300.00},
                {'symbol': 'NVDA', 'buy_point': 400.00},
                {'symbol': 'GOOGL', 'buy_point': 120.00}
            ],
            'normal': [
                {'symbol': 'MSFT', 'buy_point': 350.00},
                {'symbol': 'JNJ', 'buy_point': 160.00},
                {'symbol': 'XOM', 'buy_point': 110.00}
            ]
        }
