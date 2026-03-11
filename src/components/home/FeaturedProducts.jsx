import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import ProductCard from '../common/ProductCard';
import './FeaturedProducts.css';

import { API_ENDPOINTS } from '../../config/api';

const FeaturedProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const sectionRef = useRef(null);
    const carouselRef = useRef(null);

    useEffect(() => {
        const fetchFeaturedProducts = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.featuredProducts);
                if (!response.ok) {
                    const allResponse = await fetch(API_ENDPOINTS.products);
                    if (allResponse.ok) {
                        const data = await allResponse.json();
                        setProducts(data.filter(p => p.isFeatured || p.featured).slice(0, 10));
                    }
                } else {
                    const data = await response.json();
                    setProducts(data.slice(0, 10));
                }
            } catch (err) {
                console.error('Error fetching featured products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedProducts();
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

    // Check scroll position for navigation buttons
    const checkScrollPosition = () => {
        if (!carouselRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        const carousel = carouselRef.current;
        if (carousel) {
            carousel.addEventListener('scroll', checkScrollPosition);
            checkScrollPosition();
        }
        return () => {
            if (carousel) {
                carousel.removeEventListener('scroll', checkScrollPosition);
            }
        };
    }, [products]);

    // Drag to scroll functionality
    const handleMouseDown = (e) => {
        if (!carouselRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - carouselRef.current.offsetLeft);
        setScrollLeft(carouselRef.current.scrollLeft);
        carouselRef.current.style.cursor = 'grabbing';
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (carouselRef.current) {
            carouselRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !carouselRef.current) return;
        e.preventDefault();
        const x = e.pageX - carouselRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        if (carouselRef.current) {
            carouselRef.current.style.cursor = 'grab';
        }
    };

    // Navigation functions
    const scrollPrev = () => {
        if (!carouselRef.current) return;
        const cardWidth = 300;
        carouselRef.current.scrollBy({ left: -cardWidth * 2, behavior: 'smooth' });
    };

    const scrollNext = () => {
        if (!carouselRef.current) return;
        const cardWidth = 300;
        carouselRef.current.scrollBy({ left: cardWidth * 2, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <section className="featured-products section" ref={sectionRef}>
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">
                            <Sparkles size={14} />
                            Curated Selection
                        </span>
                        <h2>Featured <span className="text-accent">Collection</span></h2>
                    </div>
                    <div className="featured-skeleton-container">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="product-skeleton">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-content">
                                    <div className="skeleton-line"></div>
                                    <div className="skeleton-line short"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return (
            <section className="featured-products section" ref={sectionRef}>
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">
                            <Sparkles size={14} />
                            Curated Selection
                        </span>
                        <h2>Featured <span className="text-accent">Collection</span></h2>
                    </div>
                    <div className="empty-message">
                        <p>No featured products available yet. Check back soon!</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="featured-products section" ref={sectionRef}>
            <div className="container">
                <div className={`section-header-row ${isVisible ? 'animate' : ''}`}>
                    <div className="header-content">
                        <span className="section-tag">
                            <Sparkles size={14} />
                            Curated Selection
                        </span>
                        <h2>Featured <span className="text-accent">Collection</span></h2>
                    </div>
                    <div className="header-actions">
                        <div className="carousel-nav-buttons">
                            <button
                                className={`nav-btn ${!canScrollLeft ? 'disabled' : ''}`}
                                onClick={scrollPrev}
                                disabled={!canScrollLeft}
                                aria-label="Previous products"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                className={`nav-btn ${!canScrollRight ? 'disabled' : ''}`}
                                onClick={scrollNext}
                                disabled={!canScrollRight}
                                aria-label="Next products"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <Link to="/products" className="view-all">
                            View All <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>

                <div className="carousel-wrapper">
                    {/* Left Fade */}
                    <div className={`carousel-fade left ${canScrollLeft ? 'visible' : ''}`}></div>

                    {/* Products Carousel */}
                    <div
                        className={`products-carousel ${isVisible ? 'animate' : ''}`}
                        ref={carouselRef}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                    >
                        {products.map((product, index) => (
                            <div
                                key={product.id}
                                className="product-slide"
                                style={{ '--delay': `${index * 0.1}s` }}
                            >
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                    {/* Right Fade */}
                    <div className={`carousel-fade right ${canScrollRight ? 'visible' : ''}`}></div>
                </div>

                {/* Progress Indicator */}
                <div className="carousel-progress">
                    <div
                        className="progress-bar"
                        style={{
                            width: carouselRef.current
                                ? `${(carouselRef.current.scrollLeft / (carouselRef.current.scrollWidth - carouselRef.current.clientWidth)) * 100}%`
                                : '0%'
                        }}
                    ></div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts;
