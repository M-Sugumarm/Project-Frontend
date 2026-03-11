import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
    CheckCircle, Package, Truck, Home, ShoppingBag,
    Copy, Check, Sparkles, ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const { clearCart } = useCart();
    const [copied, setCopied] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);

    const orderId = searchParams.get('orderId') || `ORD${Date.now().toString().slice(-8)}`;
    const orderDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        // Clear cart after successful order
        clearCart();

        // Trigger animation sequence
        const timer = setTimeout(() => setAnimationComplete(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    const copyOrderId = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const orderTimeline = [
        { icon: CheckCircle, label: 'Order Placed', status: 'completed', time: 'Just now' },
        { icon: Package, label: 'Processing', status: 'active', time: 'Within 24 hours' },
        { icon: Truck, label: 'Shipped', status: 'pending', time: '3-5 business days' },
        { icon: Home, label: 'Delivered', status: 'pending', time: 'Expected delivery' },
    ];

    return (
        <main className="order-success-page">
            {/* Animated Background */}
            <div className="success-bg">
                <div className="confetti-container">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="confetti"
                            style={{
                                '--delay': `${Math.random() * 3}s`,
                                '--x': `${Math.random() * 100}%`,
                                '--rotation': `${Math.random() * 360}deg`,
                                '--color': ['#d4af37', '#f4d03f', '#10b981', '#6366f1', '#ec4899'][Math.floor(Math.random() * 5)]
                            }}
                        />
                    ))}
                </div>
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
            </div>

            <div className="container">
                {/* Success Card */}
                <div className={`success-card ${animationComplete ? 'animate' : ''}`}>
                    {/* Success Icon with Animation */}
                    <div className="success-icon-wrapper">
                        <div className="success-icon">
                            <CheckCircle size={60} strokeWidth={1.5} />
                            <div className="icon-ring"></div>
                            <div className="icon-ring ring-2"></div>
                        </div>
                        <div className="sparkles">
                            <Sparkles size={20} className="sparkle s1" />
                            <Sparkles size={16} className="sparkle s2" />
                            <Sparkles size={14} className="sparkle s3" />
                        </div>
                    </div>

                    <h1>Order Placed Successfully!</h1>
                    <p className="success-message">
                        Thank you for shopping with <span className="brand">Jay Shri Textile</span>.
                        Your order has been confirmed and will be processed shortly.
                    </p>

                    {/* Order ID */}
                    <div className="order-id-card">
                        <span className="label">Order ID</span>
                        <div className="order-id">
                            <span>{orderId}</span>
                            <button
                                className="copy-btn"
                                onClick={copyOrderId}
                                title="Copy Order ID"
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                        <span className="date">{orderDate}</span>
                    </div>

                    {/* Order Timeline */}
                    <div className="order-timeline">
                        <h3>Order Status</h3>
                        <div className="timeline">
                            {orderTimeline.map((step, index) => (
                                <div
                                    key={index}
                                    className={`timeline-step ${step.status}`}
                                    style={{ '--delay': `${index * 0.2}s` }}
                                >
                                    <div className="step-icon">
                                        <step.icon size={20} />
                                    </div>
                                    <div className="step-content">
                                        <span className="step-label">{step.label}</span>
                                        <span className="step-time">{step.time}</span>
                                    </div>
                                    {index < orderTimeline.length - 1 && (
                                        <div className="step-line"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="success-actions">
                        <Link to="/products" className="btn btn-primary">
                            <ShoppingBag size={18} />
                            Continue Shopping
                            <ArrowRight size={16} />
                        </Link>
                        <Link to="/" className="btn btn-secondary">
                            <Home size={18} />
                            Back to Home
                        </Link>
                    </div>

                    {/* Support Info */}
                    <div className="support-info">
                        <p>
                            Need help? Contact us at{' '}
                            <a href="mailto:support@jayshritextile.com">support@jayshritextile.com</a>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default OrderSuccess;
