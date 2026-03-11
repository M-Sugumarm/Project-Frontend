import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import './HeroCarousel.css';

const slides = [
    {
        id: 1,
        title: "Exquisite Silk Sarees",
        subtitle: "Handwoven Elegance",
        description: "Discover our premium collection of pure silk sarees crafted by master artisans",
        cta: "Shop Sarees",
        link: "/products?category=sarees",
        theme: "silk",
        pattern: "weave"
    },
    {
        id: 2,
        title: "Bridal Lehengas",
        subtitle: "Your Dream Wedding Look",
        description: "Stunning bridal lehengas with intricate embroidery and timeless designs",
        cta: "Explore Collection",
        link: "/products?category=lehengas",
        theme: "bridal",
        pattern: "embroidery"
    },
    {
        id: 3,
        title: "Designer Kurtas",
        subtitle: "Contemporary Ethnic Wear",
        description: "Modern kurtas that blend traditional craftsmanship with contemporary style",
        cta: "View Kurtas",
        link: "/products?category=kurtas",
        theme: "modern",
        pattern: "geometric"
    }
];

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (!isAutoPlaying) return;

        const timer = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(timer);
    }, [currentSlide, isAutoPlaying]);

    const nextSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const prevSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const goToSlide = (index) => {
        if (isAnimating || index === currentSlide) return;
        setIsAnimating(true);
        setCurrentSlide(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAnimating(false), 800);
    };

    const slide = slides[currentSlide];

    return (
        <section
            className="hero-carousel"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            {/* Animated Background Patterns */}
            <div className="hero-background">
                <div className={`fabric-pattern pattern-${slide.pattern}`}>
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className={`thread thread-${i % 4}`} />
                    ))}
                </div>
                <div className="gradient-overlay" />
                <div className="floating-particles">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="particle"
                            style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${15 + Math.random() * 10}s`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="hero-content container">
                <div className="content-wrapper">
                    {/* Text Content */}
                    <div className="text-content">
                        <div className="subtitle-wrapper">
                            <Sparkles className="sparkle-icon" size={20} />
                            <span className="subtitle">{slide.subtitle}</span>
                        </div>
                        <h1 className="hero-title">
                            {slide.title.split(' ').map((word, i) => (
                                <span
                                    key={i}
                                    className="title-word"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                >
                                    {word}{' '}
                                </span>
                            ))}
                        </h1>
                        <p className="hero-description">{slide.description}</p>
                        <div className="cta-buttons">
                            <Link to={slide.link} className="btn btn-primary">
                                <ShoppingBag size={20} />
                                {slide.cta}
                            </Link>
                            <Link to="/products" className="btn btn-secondary">
                                View All Products
                            </Link>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="decorative-elements">
                        <div className="fabric-swatch swatch-1" />
                        <div className="fabric-swatch swatch-2" />
                        <div className="fabric-swatch swatch-3" />
                        <div className="thread-animation">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`animated-thread thread-${i}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <button
                className="nav-button prev"
                onClick={prevSlide}
                aria-label="Previous slide"
            >
                <ChevronLeft size={28} />
            </button>
            <button
                className="nav-button next"
                onClick={nextSlide}
                aria-label="Next slide"
            >
                <ChevronRight size={28} />
            </button>

            {/* Slide Indicators */}
            <div className="slide-indicators">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`indicator ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    >
                        <span className="indicator-progress" />
                    </button>
                ))}
            </div>

            {/* Scroll Indicator */}
            <div className="scroll-indicator">
                <div className="scroll-line" />
                <span>Scroll to explore</span>
            </div>
        </section>
    );
};

export default HeroCarousel;