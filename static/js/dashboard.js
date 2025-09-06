/**
 * Dashboard JavaScript for LogoCrypto Financial Analytics Platform
 * Handles sector chart initialization and interactions
 */

// Chart.js default configuration
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#64748b';

// Color scheme for charts
const chartColors = {
    primary: '#2563eb',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    light: '#f8fafc',
    dark: '#1e293b'
};

/**
 * Initialize sector charts with provided data
 * @param {Object} sectorData - Sector data from backend
 */
function initializeSectorCharts(sectorData) {
    console.log('Initializing sector charts with data:', sectorData);
    
    let chartIndex = 1;
    
    Object.entries(sectorData).forEach(([sectorName, sectorInfo]) => {
        // Only create charts for first 4 sectors (2x2 grid)
        if (chartIndex > 4) return;
        
        const canvasId = `chart-${chartIndex}`;
        const canvas = document.getElementById(canvasId);
        
        if (!canvas) {
            console.warn(`Canvas element with id ${canvasId} not found`);
            chartIndex++;
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Prepare time series data for Chart.js
        const timeSeriesData = sectorInfo.time_series || [];
        const labels = timeSeriesData.map(point => {
            const date = new Date(point.date);
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });
        
        const prices = timeSeriesData.map(point => point.price);
        
        // Determine line color based on performance
        const lineColor = sectorInfo.change_percent >= 0 ? chartColors.success : chartColors.danger;
        const fillColor = sectorInfo.change_percent >= 0 
            ? 'rgba(16, 185, 129, 0.1)' 
            : 'rgba(239, 68, 68, 0.1)';
        
        // Create chart
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: sectorName,
                    data: prices,
                    borderColor: lineColor,
                    backgroundColor: fillColor,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: lineColor,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: lineColor,
                        borderWidth: 1,
                        cornerRadius: 6,
                        displayColors: false,
                        callbacks: {
                            title: function(context) {
                                return `${sectorName} - ${context[0].label}`;
                            },
                            label: function(context) {
                                return `Price: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 6,
                            color: '#94a3b8'
                        }
                    },
                    y: {
                        display: true,
                        grid: {
                            color: 'rgba(148, 163, 184, 0.2)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            },
                            color: '#94a3b8'
                        }
                    }
                },
                elements: {
                    line: {
                        borderJoinStyle: 'round'
                    }
                }
            }
        });
        
        chartIndex++;
    });
}

/**
 * Handle chart interactions and filters
 */
function initializeChartControls() {
    // Market type filters in sidebar
    const marketTypeSelect = document.querySelector('.sidebar select:first-of-type');
    if (marketTypeSelect) {
        marketTypeSelect.addEventListener('change', function() {
            console.log('Market type filter changed:', this.value);
            filterChartData('market_type', this.value);
        });
    }
    
    // Market chart select
    const marketChartSelect = document.querySelectorAll('.sidebar select')[1];
    if (marketChartSelect) {
        marketChartSelect.addEventListener('change', function() {
            console.log('Market chart filter changed:', this.value);
            filterChartData('market_chart', this.value);
        });
    }
    
    // Chart watchlist select
    const chartWatchlistSelect = document.querySelectorAll('.sidebar select')[2];
    if (chartWatchlistSelect) {
        chartWatchlistSelect.addEventListener('change', function() {
            console.log('Chart watchlist filter changed:', this.value);
            filterChartData('watchlist', this.value);
        });
    }
    
    // Market filter select
    const marketFilterSelect = document.querySelectorAll('.sidebar select')[3];
    if (marketFilterSelect) {
        marketFilterSelect.addEventListener('change', function() {
            console.log('Market filter changed:', this.value);
            filterChartData('market', this.value);
        });
    }
    
    // Min Market Cap filter
    const minMarketSelect = document.querySelectorAll('.sidebar select')[4];
    if (minMarketSelect) {
        minMarketSelect.addEventListener('change', function() {
            console.log('Min market cap filter changed:', this.value);
            filterChartData('min_market_cap', this.value);
        });
    }
    
    // Volume filter
    const volumeInput = document.querySelector('.sidebar input[type="number"]');
    if (volumeInput) {
        volumeInput.addEventListener('change', function() {
            console.log('Volume filter changed:', this.value);
            filterChartData('volume', this.value);
        });
    }
    
    // Reset filters button
    const resetButton = document.querySelector('.sidebar .btn-warning');
    if (resetButton) {
        resetButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Resetting filters');
            resetFilters();
        });
    }
    
    // Close button
    const closeButton = document.querySelector('.sidebar .btn-info');
    if (closeButton) {
        closeButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.innerWidth <= 992) {
                toggleSidebar();
            }
        });
    }
    
    // Subscription button
    const subscriptionButton = document.querySelector('.sidebar .btn-danger');
    if (subscriptionButton) {
        subscriptionButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = '/subscription';
        });
    }
}

/**
 * Filter chart data based on criteria
 * @param {string} filterType - Type of filter (market, volume, etc.)
 * @param {string} filterValue - Value to filter by
 */
function filterChartData(filterType, filterValue) {
    // Add loading state
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.classList.add('loading');
    }
    
    // Simulate API call delay
    setTimeout(() => {
        console.log(`Filtering by ${filterType}: ${filterValue}`);
        
        // Remove loading state
        if (mainContent) {
            mainContent.classList.remove('loading');
        }
        
        // Here you would typically make an AJAX call to get filtered data
        // For now, we'll just log the filter action
        showNotification(`Filtered by ${filterType}: ${filterValue}`, 'info');
    }, 500);
}

/**
 * Update chart display type
 * @param {string} chartType - New chart type to display
 */
function updateChartType(chartType) {
    console.log(`Updating chart type to: ${chartType}`);
    // Implementation for changing chart visualization type
    showNotification(`Chart type updated to: ${chartType}`, 'success');
}

/**
 * Reset all filters to default values
 */
function resetFilters() {
    // Reset all filter controls
    const filterControls = document.querySelectorAll('[data-filter]');
    filterControls.forEach(control => {
        if (control.tagName === 'SELECT') {
            control.selectedIndex = 0;
        } else if (control.tagName === 'INPUT') {
            control.value = control.defaultValue || '';
        }
    });
    
    showNotification('Filters reset to default values', 'info');
}

/**
 * Show notification to user
 * @param {string} message - Message to display
 * @param {string} type - Notification type (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

/**
 * Handle view stocks button clicks
 */
function initializeViewStocksButtons() {
    const viewStocksButtons = document.querySelectorAll('.btn-outline-primary');
    viewStocksButtons.forEach(button => {
        if (button.textContent.includes('View Stocks')) {
            button.addEventListener('click', function() {
                const sectorName = this.closest('.card').querySelector('h6').textContent;
                console.log(`Viewing stocks for sector: ${sectorName}`);
                
                // Navigate to watchlist with sector filter
                window.location.href = `/watchlist?sector=${encodeURIComponent(sectorName)}`;
            });
        }
    });
}

/**
 * Toggle sidebar visibility on mobile
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay') || createMobileOverlay();
    
    if (sidebar) {
        const isVisible = sidebar.classList.contains('show');
        
        if (isVisible) {
            sidebar.classList.remove('show');
            overlay.classList.remove('show');
        } else {
            sidebar.classList.add('show');
            overlay.classList.add('show');
        }
    }
}

/**
 * Create mobile overlay for sidebar
 */
function createMobileOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.onclick = toggleSidebar;
    document.body.appendChild(overlay);
    return overlay;
}

/**
 * Initialize dashboard when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard JavaScript initialized');
    
    // Initialize chart controls
    initializeChartControls();
    
    // Initialize view stocks buttons
    initializeViewStocksButtons();
    
    // Add mobile overlay for responsive sidebar
    if (window.innerWidth <= 992) {
        createMobileOverlay();
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.mobile-overlay');
        
        if (window.innerWidth > 992) {
            // Desktop view - hide sidebar mobile state
            if (sidebar) sidebar.classList.remove('show');
            if (overlay) overlay.classList.remove('show');
        }
    });
});

/**
 * Handle window resize for responsive charts
 */
window.addEventListener('resize', function() {
    // Chart.js automatically handles resize, but we can add custom logic here
    console.log('Window resized, charts will auto-adjust');
});

/**
 * Export functions for global access
 */
window.DashboardModule = {
    initializeSectorCharts,
    filterChartData,
    updateChartType,
    resetFilters,
    showNotification
};
