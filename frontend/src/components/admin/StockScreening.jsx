import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StockScreening = () => {
    const [screenings, setScreenings] = useState([]);
    const [selectedScreening, setSelectedScreening] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newScreening, setNewScreening] = useState({
        name: '',
        criteria: {
            min_price: '',
            max_price: '',
            min_volume: '',
            min_market_cap: '',
            pe_ratio_max: '',
            sectors: []
        }
    });

    useEffect(() => {
        fetchScreenings();
    }, []);

    const fetchScreenings = async () => {
        try {
            const response = await fetch('/admin/api/stock-screenings');
            const data = await response.json();
            if (data.success) {
                setScreenings(data.screenings);
            }
        } catch (error) {
            console.error('Failed to fetch screenings:', error);
        }
        setLoading(false);
    };

    const createScreening = async () => {
        if (!newScreening.name) {
            alert('Please enter a screening name');
            return;
        }

        try {
            const response = await fetch('/admin/stock-screening/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newScreening)
            });
            
            const data = await response.json();
            if (data.success) {
                await fetchScreenings();
                setShowCreateModal(false);
                setNewScreening({
                    name: '',
                    criteria: {
                        min_price: '',
                        max_price: '',
                        min_volume: '',
                        min_market_cap: '',
                        pe_ratio_max: '',
                        sectors: []
                    }
                });
                alert('Screening created successfully!');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to create screening:', error);
            alert('Failed to create screening');
        }
    };

    const updateScreening = async (screeningId) => {
        try {
            const response = await fetch(`/admin/stock-screening/${screeningId}/update`, {
                method: 'POST'
            });
            
            const data = await response.json();
            if (data.success) {
                await fetchScreenings();
                if (selectedScreening && selectedScreening.id === screeningId) {
                    setSelectedScreening({ ...selectedScreening, results_data: data.results });
                }
                alert('Screening updated successfully!');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to update screening:', error);
            alert('Failed to update screening');
        }
    };

    const deleteScreening = async (screeningId) => {
        if (!confirm('Are you sure you want to delete this screening?')) {
            return;
        }

        try {
            const response = await fetch(`/admin/stock-screening/${screeningId}/delete`, {
                method: 'POST'
            });
            
            const data = await response.json();
            if (data.success) {
                setScreenings(screenings.filter(s => s.id !== screeningId));
                if (selectedScreening && selectedScreening.id === screeningId) {
                    setSelectedScreening(null);
                }
                alert('Screening deleted successfully!');
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Failed to delete screening:', error);
            alert('Failed to delete screening');
        }
    };

    const viewScreeningResults = (screening) => {
        setSelectedScreening(screening);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="row mb-4">
                <div className="col">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4>Stock Screening</h4>
                            <p className="text-muted">Create and manage stock screening workflows</p>
                        </div>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <i className="fas fa-plus me-2"></i>New Screening
                        </button>
                    </div>
                </div>
            </div>

            {/* Screenings List */}
            <div className="row">
                <div className="col-lg-8">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Stock Screenings</h5>
                        </div>
                        <div className="card-body">
                            {screenings.length === 0 ? (
                                <div className="text-center py-4">
                                    <i className="fas fa-search fa-3x text-muted mb-3"></i>
                                    <p className="text-muted">No stock screenings found. Create one to get started.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Results</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {screenings.map(screening => (
                                                <tr key={screening.id}>
                                                    <td>
                                                        <div className="fw-bold">{screening.name}</div>
                                                        <small className="text-muted">
                                                            {screening.criteria_data.sectors?.length || 0} sectors
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-primary">
                                                            {screening.results_data?.stocks?.length || 0} stocks
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <small>{new Date(screening.created_at).toLocaleDateString()}</small>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group">
                                                            <button 
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => viewScreeningResults(screening)}
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-success"
                                                                onClick={() => updateScreening(screening.id)}
                                                            >
                                                                <i className="fas fa-sync"></i>
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => deleteScreening(screening.id)}
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Screening Results */}
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">
                                {selectedScreening ? `${selectedScreening.name} Results` : 'Screening Results'}
                            </h5>
                        </div>
                        <div className="card-body">
                            {selectedScreening ? (
                                <div>
                                    <div className="mb-3">
                                        <small className="text-muted">
                                            Found {selectedScreening.results_data?.stocks?.length || 0} stocks
                                        </small>
                                    </div>
                                    
                                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Symbol</th>
                                                    <th>Price</th>
                                                    <th>Change</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(selectedScreening.results_data?.stocks || []).map(stock => (
                                                    <tr key={stock.symbol}>
                                                        <td className="fw-bold">{stock.symbol}</td>
                                                        <td>${stock.price}</td>
                                                        <td>
                                                            <span className={`text-${stock.change_percent > 0 ? 'success' : 'danger'}`}>
                                                                {stock.change_percent > 0 ? '+' : ''}{stock.change_percent}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <div className="mt-3">
                                        <small className="text-muted">
                                            Last updated: {selectedScreening.updated_at ? 
                                                new Date(selectedScreening.updated_at).toLocaleString() : 
                                                'Never'
                                            }
                                        </small>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-chart-bar fa-2x text-muted mb-3"></i>
                                    <p className="text-muted">Select a screening to view results</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Screening Modal */}
            {showCreateModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Stock Screening</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowCreateModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Screening Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newScreening.name}
                                        onChange={(e) => setNewScreening({
                                            ...newScreening,
                                            name: e.target.value
                                        })}
                                        placeholder="e.g., High Volume Tech Stocks"
                                    />
                                </div>
                                
                                <h6>Screening Criteria</h6>
                                
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Min Price ($)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newScreening.criteria.min_price}
                                            onChange={(e) => setNewScreening({
                                                ...newScreening,
                                                criteria: {
                                                    ...newScreening.criteria,
                                                    min_price: e.target.value
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Max Price ($)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newScreening.criteria.max_price}
                                            onChange={(e) => setNewScreening({
                                                ...newScreening,
                                                criteria: {
                                                    ...newScreening.criteria,
                                                    max_price: e.target.value
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label">Min Volume</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={newScreening.criteria.min_volume}
                                        onChange={(e) => setNewScreening({
                                            ...newScreening,
                                            criteria: {
                                                ...newScreening.criteria,
                                                min_volume: e.target.value
                                            }
                                        })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={createScreening}
                                >
                                    Create Screening
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {showCreateModal && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default StockScreening;