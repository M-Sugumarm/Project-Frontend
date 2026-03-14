import { useState, useEffect, useRef } from 'react';
import HeroCarousel from '../components/home/HeroCarousel';
import FeaturedProducts from '../components/home/FeaturedProducts';
import Categories from '../components/home/Categories';
import ShopTheLook from '../components/home/ShopTheLook';
// UpcomingProducts removed from home page
import { Truck, RotateCcw, Shield, Headphones, ChevronLeft, ChevronRight, Star, Quote, Mail, CheckCircle, Loader } from 'lucide-react';
import './Home.css';

import API_BASE_URL from '../config/api';
import { API_ENDPOINTS } from '../config/api';

// Animated counter hook
const useCountUp = (end, duration = 2000, startCounting) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!startCounting) return;

        let startTime;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * end));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration, startCounting]);

    return count;
};

// Stats data
const statsData = [
    { number: 500, suffix: '+', label: 'Unique Products', icon: '✨' },
    { number: 50, suffix: 'K+', label: 'Happy Customers', icon: '💝' },
    { number: 100, suffix: '+', label: 'Master Artisans', icon: '🎨' },
    { number: 15, suffix: '+', label: 'Years of Excellence', icon: '🏆' }
];

// Testimonials data
const testimonials = [
    {
        content: "The quality of the silk saree I purchased exceeded all my expectations. The craftsmanship is truly exceptional. Jay Shri Textile has become my go-to for ethnic wear.",
        author: "Priya Sharma",
        location: "Mumbai",
        initials: "PS",
        rating: 5
    },
    {
        content: "My bridal lehenga from Jay Shri Textile was absolutely stunning. The attention to detail and the personal service made my wedding shopping a memorable experience.",
        author: "Anjali Kapoor",
        location: "Delhi",
        initials: "AK",
        rating: 5
    },
    {
        content: "I've been shopping here for years. The collection is always fresh and on-trend while maintaining the traditional essence. Highly recommended!",
        author: "Rekha Menon",
        location: "Bangalore",
        initials: "RM",
        rating: 5
    },
    {
        content: "The customer service is exceptional. They helped me find the perfect outfit for my daughter's engagement. The quality and pricing are unmatched.",
        author: "Sunita Patel",
        location: "Ahmedabad",
        initials: "SP",
        rating: 5
    }
];

// Stat Card Component
const StatCard = ({ stat, index, isVisible }) => {
    const count = useCountUp(stat.number, 2000, isVisible);

    return (
        <div
            className="stat-card"
            style={{ animationDelay: `${index * 0.15}s` }}
        >
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
                <span className="stat-number">
                    {count}{stat.suffix}
                </span>
                <span className="stat-label">{stat.label}</span>
            </div>
            <div className="stat-glow"></div>
        </div>
    );
};

const Home = () => {
    const [statsVisible, setStatsVisible] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const statsRef = useRef(null);

    // Newsletter subscription state
    const [subName, setSubName] = useState('');
    const [subEmail, setSubEmail] = useState('');
    const [subStatus, setSubStatus] = useState('idle'); // idle | loading | success | error
    const [subMessage, setSubMessage] = useState('');

    useEffect(() => {
        console.log('--- SYSTEM DEBUG: Current API URL is:', API_BASE_URL);
    }, []);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!subEmail.trim()) return;
        setSubStatus('loading');
        try {
            const res = await fetch(`${API_BASE_URL}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: subEmail.trim(), name: subName.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setSubStatus('success');
                setSubMessage(data.message || 'You are subscribed! 🎉');
                setSubName('');
                setSubEmail('');
            } else {
                setSubStatus('error');
                setSubMessage(data.message || 'Something went wrong. Please try again.');
            }
        } catch {
            setSubStatus('error');
            setSubMessage('Could not connect to server. Please try again later.');
        }
    };

    // Intersection observer for stats animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStatsVisible(true);
                }
            },
            { threshold: 0.3 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Auto-play testimonials
    useEffect(() => {
        if (!isAutoPlaying) return;

        const timer = setInterval(() => {
            setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    const nextTestimonial = () => {
        setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
        setIsAutoPlaying(false);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length);
        setIsAutoPlaying(false);
    };

    return (
        <main className="home-page">
            <HeroCarousel />

            {/* Enhanced Stats Bar */}
            <section className="stats-bar" ref={statsRef}>
                <div className="stats-background">
                    <div className="floating-shapes">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={`shape shape-${i + 1}`}></div>
                        ))}
                    </div>
                </div>
                <div className="container">
                    <div className="stats-grid">
                        {statsData.map((stat, index) => (
                            <StatCard
                                key={index}
                                stat={stat}
                                index={index}
                                isVisible={statsVisible}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <FeaturedProducts />
            <Categories />
            <ShopTheLook />

            {/* Enhanced Testimonials Section */}
            <section className="testimonials-section section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-tag">Customer Love</span>
                        <h2>What Our <span className="text-accent">Customers</span> Say</h2>
                        <p className="section-subtitle">Trusted by thousands of happy customers across India</p>
                    </div>

                    <div
                        className="testimonials-carousel"
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                    >
                        <button
                            className="carousel-nav prev"
                            onClick={prevTestimonial}
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <div className="testimonials-track">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className={`testimonial-card ${index === currentTestimonial ? 'active' : ''} ${index === (currentTestimonial - 1 + testimonials.length) % testimonials.length ? 'prev' : ''
                                        } ${index === (currentTestimonial + 1) % testimonials.length ? 'next' : ''
                                        }`}
                                >
                                    <div className="quote-icon">
                                        <Quote size={32} />
                                    </div>
                                    <div className="testimonial-rating">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} size={16} fill="#4f46e5" stroke="#4f46e5" />
                                        ))}
                                    </div>
                                    <div className="testimonial-content">
                                        <p>{testimonial.content}</p>
                                    </div>
                                    <div className="testimonial-author">
                                        <div className="author-avatar">
                                            <span>{testimonial.initials}</span>
                                            <div className="avatar-ring"></div>
                                        </div>
                                        <div className="author-info">
                                            <strong>{testimonial.author}</strong>
                                            <span>{testimonial.location}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="carousel-nav next"
                            onClick={nextTestimonial}
                            aria-label="Next testimonial"
                        >
                            <ChevronRight size={24} />
                        </button>

                        <div className="testimonial-dots">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    className={`dot ${index === currentTestimonial ? 'active' : ''}`}
                                    onClick={() => {
                                        setCurrentTestimonial(index);
                                        setIsAutoPlaying(false);
                                    }}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== EMAIL SUBSCRIPTION / NEWSLETTER ===== */}
            <section className="newsletter-section">
                <div className="newsletter-bg-glow" />
                <div className="container">
                    <div className="newsletter-inner">
                        {/* Left text */}
                        <div className="newsletter-text">
                            <span className="newsletter-tag">
                                <Mail size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                Stay in the Loop
                            </span>
                            <h2>
                                Get <span className="nl-accent">Exclusive Offers</span><br />
                                Straight to Your Inbox
                            </h2>
                            <p>
                                Subscribe and be the first to receive flash-sale alerts, new arrivals,
                                and members-only deals — curated just for you.
                            </p>
                            <ul className="newsletter-perks">
                                <li>🔥 Flash sale &amp; discount alerts</li>
                                <li>✨ New collection announcements</li>
                                <li>🎁 Subscriber-only special offers</li>
                            </ul>
                        </div>

                        {/* Right form */}
                        <div className="newsletter-form-card">
                            {subStatus === 'success' ? (
                                <div className="nl-success">
                                    <div className="nl-success-icon">
                                        <CheckCircle size={48} />
                                    </div>
                                    <h3>You're Subscribed! 🎉</h3>
                                    <p>{subMessage}</p>
                                    <p className="nl-inbox-note">Check your inbox for a welcome gift from us.</p>
                                    <button
                                        className="nl-reset-btn"
                                        onClick={() => setSubStatus('idle')}
                                    >
                                        Subscribe another email
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubscribe} className="nl-form">
                                    <h3>Join Our VIP List</h3>
                                    <p className="nl-form-sub">No spam, unsubscribe anytime.</p>
                                    <div className="nl-field">
                                        <label htmlFor="sub-name">Your Name</label>
                                        <input
                                            id="sub-name"
                                            type="text"
                                            placeholder="Priya Sharma"
                                            value={subName}
                                            onChange={e => setSubName(e.target.value)}
                                        />
                                    </div>
                                    <div className="nl-field">
                                        <label htmlFor="sub-email">Email Address <span>*</span></label>
                                        <input
                                            id="sub-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={subEmail}
                                            onChange={e => setSubEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    {subStatus === 'error' && (
                                        <p className="nl-error">{subMessage}</p>
                                    )}
                                    <button
                                        type="submit"
                                        className="nl-submit-btn"
                                        disabled={subStatus === 'loading'}
                                    >
                                        {subStatus === 'loading' ? (
                                            <><Loader size={16} className="nl-spinner" /> Subscribing...</>
                                        ) : (
                                            <>Subscribe &amp; Get Offers →</>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <Truck size={28} strokeWidth={1.5} />
                                <div className="icon-bg"></div>
                            </div>
                            <h4>Free Shipping</h4>
                            <p>On orders above ₹2,999</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <RotateCcw size={28} strokeWidth={1.5} />
                                <div className="icon-bg"></div>
                            </div>
                            <h4>Easy Returns</h4>
                            <p>15-day hassle-free returns</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <Shield size={28} strokeWidth={1.5} />
                                <div className="icon-bg"></div>
                            </div>
                            <h4>Secure Payment</h4>
                            <p>100% secure transactions</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon-wrapper">
                                <Headphones size={28} strokeWidth={1.5} />
                                <div className="icon-bg"></div>
                            </div>
                            <h4>24/7 Support</h4>
                            <p>Dedicated customer service</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Home;
