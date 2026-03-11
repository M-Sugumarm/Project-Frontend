import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Eye, Filter, Check, X, Clock, Package, Truck, Calendar, RefreshCw, Download } from 'lucide-react';
import { ordersApi } from '../../services/api';
import Loader from '../../components/common/Loader';
import './Orders.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(null);

    const fetchOrders = async () => {
        try {
            // Only set loading on initial fetch
            if (orders.length === 0) setLoading(true);
            const response = await ordersApi.getAllAdmin();
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll every 15 seconds for real-time updates
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            setUpdatingStatus(orderId);
            await ordersApi.updateStatus(orderId, newStatus);

            // Optimistic update
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.user?.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'pending';
            case 'processing': return 'processing';
            case 'shipped': return 'shipped';
            case 'delivered': return 'delivered';
            case 'cancelled': return 'cancelled';
            default: return '';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return <Clock size={14} />;
            case 'processing': return <Package size={14} />;
            case 'shipped': return <Truck size={14} />;
            case 'delivered': return <Check size={14} />;
            case 'cancelled': return <X size={14} />;
            default: return <Clock size={14} />;
        }
    };

    if (loading) {
        return <Loader size="lg" text="Loading orders..." />;
    }

    return (
        <div className="orders-page">
            <div className="page-header">
                <div>
                    <h1>Orders</h1>
                    <p>Manage and track customer orders ({orders.length})</p>
                </div>
                <div className="header-actions">
                    <button
                        className={`btn btn-secondary ${refreshing ? 'refreshing' : ''}`}
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={18} /> {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button className="btn btn-primary">
                        <Download size={18} /> Export Orders
                    </button>
                </div>
            </div>

            <div className="toolbar">
                <div className="search-box">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <div className="filter-dropdown">
                        <Filter size={16} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Items</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.id} className="order-row">
                                    <td className="order-id">#{order.id?.substring(0, 8) || '...'}</td>
                                    <td>
                                        <div className="customer-info">
                                            <span className="customer-email">{order.email || order.user?.email || 'Guest'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="date-info">
                                            <Calendar size={14} />
                                            <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="order-total">₹{order.totalAmount?.toLocaleString() || '0'}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status || 'UNKNOWN'}
                                        </span>
                                    </td>
                                    <td>{order.items?.length || 0} items</td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                className="action-btn view"
                                                onClick={() => setSelectedOrder(order)}
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <div className="status-actions">
                                                <select
                                                    value={order.status || 'PENDING'}
                                                    onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                    disabled={updatingStatus === order.id}
                                                    className="status-select-mini"
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="PROCESSING">Processing</option>
                                                    <option value="SHIPPED">Shipped</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                    No orders found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {selectedOrder && createPortal(
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content order-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Order Details #{selectedOrder.id?.substring(0, 8)}</h2>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="order-summary-grid">
                                <div className="summary-card">
                                    <h3>Customer Info</h3>
                                    <p><strong>Email:</strong> {selectedOrder.email || selectedOrder.user?.email || 'Guest'}</p>
                                    <p><strong>Date:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}</p>
                                    <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Online'}</p>
                                </div>
                                <div className="summary-card">
                                    <h3>Shipping Address</h3>
                                    <p>{selectedOrder.shippingAddress || 'No address provided'}</p>
                                </div>
                            </div>

                            <div className="order-items-list" style={{ marginTop: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '600' }}>Order Items</h3>
                                <div className="items-table-wrapper">
                                    <table className="items-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Price</th>
                                                <th>Qty</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items?.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            {item.imageUrl && (
                                                                <img
                                                                    src={item.imageUrl}
                                                                    alt={item.productName}
                                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                                                />
                                                            )}
                                                            <span>{item.productName || 'Unknown Product'}</span>
                                                        </div>
                                                    </td>
                                                    <td>₹{item.price?.toLocaleString() || '0'}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>₹{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: '1rem' }}>Total:</td>
                                                <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{selectedOrder.totalAmount?.toLocaleString() || '0'}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div className="order-actions-footer" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                                <span style={{ alignSelf: 'center', fontSize: '0.9rem', color: '#666' }}>Update Status:</span>
                                {['PROCESSING', 'SHIPPED', 'DELIVERED'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                                        disabled={selectedOrder.status === status || updatingStatus === selectedOrder.id}
                                        className={`btn ${selectedOrder.status === status ? 'btn-disabled' : 'btn-secondary'}`}
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                    >
                                        Mark as {status.charAt(0) + status.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Orders;
