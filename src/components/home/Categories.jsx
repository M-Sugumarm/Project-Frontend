import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import './Categories.css';

import { API_ENDPOINTS } from '../../config/api';

// Category fallback images based on common textile categories
const CATEGORY_FALLBACK_IMAGES = {
    'saree': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop',
    'silk': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop',
    'lehenga': 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=600&fit=crop',
    'bridal': 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=600&fit=crop',
    'kurta': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=600&fit=crop',
    'mens': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=600&fit=crop',
    'ethnic': 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=600&fit=crop',
    'dupatta': 'https://images.unsplash.com/photo-1617627143233-46e3ba0e97c5?w=800&h=600&fit=crop',
    'salwar': 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=600&fit=crop',
    'default': 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=600&fit=crop'
};

// Get appropriate fallback image for a category
const getCategoryImage = (category) => {
    if (category.imageUrl) return category.imageUrl;

    const name = (category.name || '').toLowerCase();
    for (const [key, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
        if (name.includes(key)) return url;
    }
    return CATEGORY_FALLBACK_IMAGES.default;
};

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.categories);
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Intersection observer for scroll animations
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

    // Mouse parallax effect
    const handleMouseMove = (e, cardRef) => {
        if (!cardRef) return;
        const rect = cardRef.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        cardRef.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    };

    const handleMouseLeave = (cardRef) => {
        if (!cardRef) return;
        cardRef.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    };

    if (loading) {
        return (
            <section className="categories-section section" ref={sectionRef}>
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">Browse By</span>
                        <h2>Shop by <span className="text-accent">Category</span></h2>
                    </div>
                    <div className="categories-grid">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`category-skeleton ${i === 1 ? 'large' : ''}`}>
                                <div className="skeleton-shimmer"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    // Define layout patterns for bento grid
    const getCardSize = (index, total) => {
        if (total <= 3) return index === 0 ? 'large' : 'medium';
        if (total === 4) return index === 0 || index === 3 ? 'large' : 'medium';
        if (total >= 5) {
            if (index === 0) return 'featured';
            if (index === 1 || index === 2) return 'medium';
            return 'small';
        }
        return 'medium';
    };

    return (
        <section className="categories-section section" ref={sectionRef}>
            <div className="container">
                {/* Section Header with animation */}
                <div className={`section-header ${isVisible ? 'animate' : ''}`}>
                    <span className="section-tag">
                        <Sparkles size={14} />
                        Browse By
                    </span>
                    <h2>Shop by <span className="text-accent">Category</span></h2>
                    <p className="section-description">
                        Explore our diverse range of textiles, from traditional weaves to contemporary designs.
                    </p>
                </div>

                {/* Grid Categories */}
                <div className={`categories-bento ${isVisible ? 'animate' : ''}`}>
                    {categories
                        .filter(cat => {
                            const name = cat.name.toLowerCase();
                            // Filter out Salwar Suits, Accessories, Cotton Sarees, and Silk Sarees
                            return !name.includes('salwar') && !name.includes('accessories') && !name.includes('cotton') && !name.includes('silk');
                        })
                        .slice(0, 5)
                        .map((category, index) => {
                            return (
                                <Link
                                    to={`/products?category=${category.id}`}
                                    key={category.id}
                                    className="category-card"
                                    style={{ '--delay': `${index * 0.1}s` }}
                                    onMouseMove={(e) => {
                                        const cardRef = e.currentTarget;
                                        const rect = cardRef.getBoundingClientRect();
                                        const x = e.clientX - rect.left;
                                        const y = e.clientY - rect.top;
                                        const centerX = rect.width / 2;
                                        const centerY = rect.height / 2;
                                        const rotateX = (y - centerY) / 20;
                                        const rotateY = (centerX - x) / 20;
                                        cardRef.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
                                    }}
                                >
                                    {/* Background Image with Ken Burns */}
                                    <div className="category-image">
                                        <img
                                            src={getCategoryImage(category)}
                                            alt={category.name}
                                            loading="lazy"
                                            onError={(e) => { e.target.src = CATEGORY_FALLBACK_IMAGES.default; }}
                                        />
                                    </div>

                                    {/* Gradient Overlay */}
                                    <div className="category-overlay">
                                        <div className="overlay-gradient"></div>
                                        <div className="overlay-pattern"></div>
                                    </div>

                                    {/* Content */}
                                    <div className="category-content">
                                        {category.productCount > 0 && (
                                            <div className="category-badge">
                                                <span className="product-count">
                                                    {category.productCount} Products
                                                </span>
                                            </div>
                                        )}

                                        <h3 className="category-name">
                                            <span className="name-text">{category.name}</span>
                                            <span className="name-underline"></span>
                                        </h3>

                                        {category.description && (
                                            <p className="category-description">
                                                {category.description}
                                            </p>
                                        )}

                                        <div className="category-cta">
                                            <span>Explore</span>
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>

                                    {/* Hover Glow Effect */}
                                    <div className="card-glow"></div>
                                </Link>
                            );
                        })}
                </div>

                {/* View All Link */}
                {categories.length > 6 && (
                    <div className="section-footer">
                        <Link to="/products" className="view-all-btn">
                            View All Categories
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Categories;
