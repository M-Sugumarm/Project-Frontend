import React, { useState, useEffect } from 'react';
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Package, Calendar, AlertCircle, Loader } from 'lucide-react';
import api from '../services/api';
import './MyOrders.css';

const MyOrders = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!isLoaded || !isSignedIn || !user) return;

            try {
                setLoading(true);
                // Use user.id to fetch orders
                const response = await api.get(`/orders/user/${user.id}`);
                // Sort by createdAt desc
                const sortedOrders = response.data.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setOrders(sortedOrders);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Failed to load your orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isLoaded, isSignedIn, user]);

    if (!isLoaded) {
        return (
            <div className="loading-container">
                <Loader className="animate-spin" size={32} />
            </div>
        );
    }

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    return (
        <div className="my-orders-page">
            <div className="my-orders-container">
                <div className="page-header">
                    <h1>My Orders</h1>
                    <p>Track and manage your recent purchases</p>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <Loader className="animate-spin" size={40} color="#0f172a" />
                        <p>Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                        <h3>Something went wrong</h3>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={() => window.location.reload()}>
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-state">
                        <Package size={64} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>No orders yet</h3>
                        <p>Looks like you haven't placed any orders with us yet.</p>
                        <Link to="/products" className="shop-now-btn">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-info">
                                        <div className="info-group">
                                            <label>Order Placed</label>
                                            <span>
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <div className="info-group">
                                            <label>Total Amount</label>
                                            <span>₹{order.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="info-group">
                                            <label>Order ID</label>
                                            <span style={{ fontFamily: 'monospace' }}>#{order.id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <span className={`order-status status-${order.status.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="order-content">
                                    <div className="order-items">
                                        {order.items.map((item, index) => (
                                            <div key={`${order.id}-item-${index}`} className="order-item">
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.productName}
                                                    className="item-image"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/80?text=Product';
                                                    }}
                                                />
                                                <div className="item-details">
                                                    <h3>{item.productName}</h3>
                                                    <div className="item-meta">
                                                        {item.selectedSize && <span>Size: {item.selectedSize} • </span>}
                                                        {item.selectedColor && <span>Color: {item.selectedColor} • </span>}
                                                        <span>Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="item-price">
                                                    ₹{item.price.toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
