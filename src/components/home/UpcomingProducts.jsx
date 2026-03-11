import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Clock, Bell, Sparkles } from 'lucide-react';
import './UpcomingProducts.css';

import { API_ENDPOINTS } from '../../config/api';

// Fallback image for upcoming products
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=800&fit=crop';

const UpcomingProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [notifiedProducts, setNotifiedProducts] = useState(new Set());
    const sectionRef = useRef(null);

    useEffect(() => {
        const fetchUpcomingProducts = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.products);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data.filter(p => p.isUpcoming || p.upcoming).slice(0, 4));
                }
            } catch (err) {
                console.error('Error fetching upcoming products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUpcomingProducts();
    }, []);

    // Intersection observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleNotify = (e, productId) => {
        e.preventDefault();
        setNotifiedProducts(prev => new Set([...prev, productId]));
        // Add animation feedback
        const btn = e.currentTarget;
        btn.classList.add('notified-animation');
        setTimeout(() => btn.classList.remove('notified-animation'), 600);
    };

    if (loading || products.length === 0) {
        return null;
    }

    return (
        <section className="upcoming-section section" ref={sectionRef}>
            {/* Background decoration */}
            <div className="upcoming-bg-decoration">
                <div className="decoration-circle circle-1"></div>
                <div className="decoration-circle circle-2"></div>
                <div className="decoration-line"></div>
            </div>

            <div className="container">
                <div className={`section-header ${isVisible ? 'animate' : ''}`}>
                    <span className="section-tag">
                        <Sparkles size={14} />
                        Coming Soon
                    </span>
                    <h2>Upcoming <span className="text-accent">Arrivals</span></h2>
                    <p className="section-description">
                        Be the first to know when these exclusive pieces become available
                    </p>
                </div>

                <div className={`upcoming-grid ${isVisible ? 'animate' : ''}`}>
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="upcoming-card"
                            style={{ '--delay': `${index * 0.15}s` }}
                        >
                            {/* Product Image with Spotlight */}
                            <div className="upcoming-image">
                                <img
                                    src={product.imageUrl || FALLBACK_IMAGE}
                                    alt={product.name}
                                    loading="lazy"
                                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                                />
                                <div className="image-overlay">
                                    <div className="spotlight"></div>
                                </div>

                                {/* Coming Soon Badge */}
                                <div className="coming-soon-badge">
                                    <Clock size={14} />
                                    <span>Coming Soon</span>
                                    <div className="badge-glow"></div>
                                </div>

                                {/* Quick Preview on Hover */}
                                <div className="hover-preview">
                                    <span className="preview-text">Preview</span>
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="upcoming-info">
                                <span className="product-category">
                                    {product.category?.name || 'New Arrival'}
                                </span>
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-price">₹{product.price?.toLocaleString()}</p>

                                {/* Notify Button */}
                                <button
                                    className={`notify-btn ${notifiedProducts.has(product.id) ? 'notified' : ''}`}
                                    onClick={(e) => handleNotify(e, product.id)}
                                    disabled={notifiedProducts.has(product.id)}
                                >
                                    {notifiedProducts.has(product.id) ? (
                                        <>
                                            <span className="check-icon">✓</span>
                                            We'll Notify You
                                        </>
                                    ) : (
                                        <>
                                            <Bell size={16} />
                                            Notify Me
                                        </>
                                    )}
                                    <div className="btn-shine"></div>
                                </button>
                            </div>

                            {/* Card border glow */}
                            <div className="card-border"></div>
                        </div>
                    ))}
                </div>

                {/* View All */}
                <div className={`section-footer ${isVisible ? 'animate' : ''}`}>
                    <a href="/products" className="view-all-btn">
                        <span>View All Upcoming</span>
                        <ArrowRight size={18} />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default UpcomingProducts;
