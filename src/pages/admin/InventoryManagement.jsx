import { useState, useEffect } from 'react';
import { Package, AlertTriangle, RefreshCw, Plus, Minus, Search } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import './InventoryManagement.css';
// We can still import shared styles if needed, but InventoryManagement.css handles specific overrides
// import './ProductManagement.css'; 

const InventoryManagement = () => {
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalStock: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        averageStock: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, low, out
    const [editingStock, setEditingStock] = useState({});

    const fetchInventory = async () => {
        try {
            const [productsRes, statsRes] = await Promise.all([
                api.get('/inventory'),
                api.get('/inventory/stats')
            ]);
            setProducts(productsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching inventory:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInventory();
        const interval = setInterval(fetchInventory, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchInventory();
    };

    const handleStockChange = (productId, value) => {
        setEditingStock(prev => ({
            ...prev,
            [productId]: value
        }));
    };

    const updateStock = async (productId, operation) => {
        const quantity = parseInt(editingStock[productId]) || 0;
        if (quantity <= 0) return;

        try {
            await api.put(`/inventory/${productId}`, {
                quantity,
                operation
            });
            setEditingStock(prev => ({ ...prev, [productId]: '' }));
            fetchInventory();
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('Failed to update stock: ' + error.message);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'low' ? product.stock < 10 && product.stock > 0 :
                    filter === 'out' ? product.stock === 0 : true;
        return matchesSearch && matchesFilter;
    });

    const getStockStatus = (stock) => {
        if (stock === 0) return { class: 'out', label: 'Out of Stock' };
        if (stock < 10) return { class: 'low', label: 'Low Stock' };
        return { class: 'instock', label: 'In Stock' };
    };

    if (loading) {
        return <Loader size="lg" text="Loading inventory data..." />;
    }

    return (
        <div className="inventory-page">
            <div className="page-header">
                <div>
                    <h1>Inventory Management</h1>
                    <p>Real-time stock tracking and management</p>
                </div>
                <button
                    className={`btn btn-secondary ${refreshing ? 'refreshing' : ''}`}
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    <RefreshCw size={18} />
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        <Package size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Products</span>
                        <span className="stat-value">{stats.totalProducts}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
                        <Package size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Stock</span>
                        <span className="stat-value">{stats.totalStock}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fefce8', color: '#eab308' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Low Stock</span>
                        <span className="stat-value">{stats.lowStockCount}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Out of Stock</span>
                        <span className="stat-value">{stats.outOfStockCount}</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="all">All Inventory</option>
                    <option value="low">Low Stock (&lt; 10)</option>
                    <option value="out">Out of Stock (0)</option>
                </select>
            </div>

            {/* Inventory Table */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th style={{ textAlign: 'center' }}>Current Stock</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                            <th style={{ textAlign: 'center' }}>Price</th>
                            <th style={{ textAlign: 'center' }}>Quick Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => {
                            const status = getStockStatus(product.stock);
                            return (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-cell">
                                            {product.imageUrl && (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                />
                                            )}
                                            <div>
                                                <span className="product-name">{product.name}</span>
                                                <span className="product-id">{product.brand}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`current-stock-value ${status.class}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`stock-badge ${status.class}`}>
                                            {status.label}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="price">₹{product.price?.toLocaleString() || 0}</span>
                                    </td>
                                    <td>
                                        <div className="stock-control">
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder="Qty"
                                                value={editingStock[product.id] || ''}
                                                onChange={(e) => handleStockChange(product.id, e.target.value)}
                                                className="stock-input"
                                            />
                                            <button
                                                className="stock-btn add"
                                                onClick={() => updateStock(product.id, 'ADD')}
                                                disabled={!editingStock[product.id]}
                                                title="Add Stock"
                                            >
                                                <Plus size={16} />
                                            </button>
                                            <button
                                                className="stock-btn sub"
                                                onClick={() => updateStock(product.id, 'SUBTRACT')}
                                                disabled={!editingStock[product.id]}
                                                title="Remove Stock"
                                            >
                                                <Minus size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && (
                    <div className="empty-state">
                        <Package size={48} />
                        <p>No products found matching your criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryManagement;
