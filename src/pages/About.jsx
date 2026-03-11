import React from 'react';
import { MapPin, Phone, Mail, Clock, Award, Users, Heart, TrendingUp } from 'lucide-react';
import './About.css';

const About = () => {
    const slides = [
        { src: '/images/shop/interior-service.jpg', alt: 'Jay Shri Textile Store Interior', caption: 'Premium Service Quality' },
        { src: '/images/shop/interior-fabrics.png', alt: 'Fabric Collection', caption: 'Exquisite Collections' },
        { src: '/images/shop/shop-interior.png', alt: 'Shop Interior View', caption: 'Welcome to Jay Shri' },
    ];

    return (
        <main className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="container">
                    <div className="about-hero-content">
                        <span className="section-tag">Our Story</span>
                        <h1>Welcome to <span className="text-accent">Jay Shri Textile</span></h1>
                        <p className="hero-description">
                            Celebrating 17 years of excellence in bringing you the finest handcrafted textiles from the heart of Tiruppur, Tamil Nadu.
                        </p>
                    </div>
                </div>
            </section>

            {/* Company Info Section */}
            <section className="company-info section-padding">
                <div className="container">
                    <div className="info-grid">

                        {/* Location */}
                        <div className="info-card">
                            <div className="info-icon">
                                <MapPin size={32} />
                            </div>
                            <h3>Our Location</h3>
                            <p>
                                55, Kulli Chettiar Street<br />
                                Kamaraj Rd, Tiruppur<br />
                                Tamil Nadu 641604
                            </p>
                        </div>

                        {/* Phone */}
                        <div className="info-card">
                            <div className="info-icon">
                                <Phone size={32} />
                            </div>
                            <h3>Call Us</h3>
                            <a href="tel:09443256412">
                                094432 56412
                            </a>
                            <span className="info-subtitle">Business hours only</span>
                        </div>

                        {/* Hours */}
                        <div className="info-card">
                            <div className="info-icon">
                                <Clock size={32} />
                            </div>
                            <h3>Business Hours</h3>
                            <p>Open Daily</p>
                            <span className="info-subtitle">Closes 8:00 PM</span>
                        </div>

                        {/* Email */}
                        <div className="info-card">
                            <div className="info-icon">
                                <Mail size={32} />
                            </div>
                            <h3>Email Us</h3>
                            <a href="mailto:info@jayshritextile.com">
                                info@jayshritextile.com
                            </a>
                            <span className="info-subtitle">Reply within 24 hours</span>
                        </div>

                    </div>
                </div>
            </section>


            {/* Our Story Section */}
            <section className="our-story section-padding">
                <div className="container">
                    <div className="story-content">
                        {/* Left: Text Content in Box */}
                        <div className="story-text-wrapper">
                            <div className="story-text">
                                <span className="section-tag">Since 2008</span>
                                <h2>17 Years of <span className="text-accent">Textile Excellence</span></h2>

                                <p>
                                    Founded in the textile hub of Tiruppur, Tamil Nadu, Jay Shri Textile has been a trusted name in premium fabrics and ethnic wear for over 17 years. What started as a small family business has grown into a beloved destination for quality textiles.
                                </p>

                                <p>
                                    Located at the heart of Tiruppur on Kulli Chettiar Street, we pride ourselves on offering an exquisite collection of sarees, lehengas, kurtas, and traditional Indian wear. Our commitment to quality, authenticity, and customer satisfaction has made us a preferred choice for generations of customers.
                                </p>

                                <p>
                                    Every piece in our collection is carefully selected to ensure it meets our high standards of craftsmanship and quality. From everyday wear to special occasion outfits, we bring you the finest textiles that celebrate India's rich heritage.
                                </p>
                            </div>
                        </div>

                        {/* Right: Image Carousel using Bootstrap */}
                        <div className="story-carousel-wrapper">
                            <div id="storyCarousel" className="carousel slide story-carousel" data-bs-ride="carousel" data-bs-interval="4000">
                                {/* Indicators */}
                                <div className="carousel-indicators carousel-dots">
                                    {slides.map((_, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            data-bs-target="#storyCarousel"
                                            data-bs-slide-to={idx}
                                            className={`carousel-dot ${idx === 0 ? 'active' : ''}`}
                                            aria-current={idx === 0 ? 'true' : undefined}
                                            aria-label={`Slide ${idx + 1}`}
                                        />
                                    ))}
                                </div>

                                {/* Slides */}
                                <div className="carousel-inner carousel-slides">
                                    {slides.map((slide, idx) => (
                                        <div key={idx} className={`carousel-item carousel-slide ${idx === 0 ? 'active' : ''}`}>
                                            <img src={slide.src} alt={slide.alt} />
                                            <div className="carousel-caption">
                                                <span>{slide.caption}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Navigation Arrows */}
                                <button className="carousel-control-prev carousel-btn carousel-btn-prev" type="button" data-bs-target="#storyCarousel" data-bs-slide="prev">
                                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Previous</span>
                                </button>
                                <button className="carousel-control-next carousel-btn carousel-btn-next" type="button" data-bs-target="#storyCarousel" data-bs-slide="next">
                                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                    <span className="visually-hidden">Next</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="story-stats mt-5">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <Award size={40} />
                            </div>
                            <div className="stat-content">
                                <h3>17+</h3>
                                <p>Years in Business</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <Users size={40} />
                            </div>
                            <div className="stat-content">
                                <h3>50K+</h3>
                                <p>Happy Customers</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <Heart size={40} />
                            </div>
                            <div className="stat-content">
                                <h3>100%</h3>
                                <p>Quality Guaranteed</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">
                                <TrendingUp size={40} />
                            </div>
                            <div className="stat-content">
                                <h3>500+</h3>
                                <p>Unique Products</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="values-section section-padding">
                <div className="container">
                    <div className="text-center mb-5">
                        <span className="section-tag">What We Stand For</span>
                        <h2 className="section-title">Our <span className="text-accent">Values</span></h2>
                    </div>
                    <div className="values-grid">
                        <div className="value-card">
                            <h3>Quality First</h3>
                            <p>
                                We never compromise on quality. Every product is carefully inspected to ensure it meets our stringent standards before reaching you.
                            </p>
                        </div>
                        <div className="value-card">
                            <h3>Authentic Craftsmanship</h3>
                            <p>
                                We celebrate traditional Indian craftsmanship and work with skilled artisans to bring you authentic, handcrafted textiles.
                            </p>
                        </div>
                        <div className="value-card">
                            <h3>Customer Satisfaction</h3>
                            <p>
                                Your satisfaction is our priority. We go the extra mile to ensure you have a wonderful shopping experience with us.
                            </p>
                        </div>
                        <div className="value-card">
                            <h3>Fair Pricing</h3>
                            <p>
                                We believe in transparent, fair pricing. You get premium quality textiles at honest prices, without hidden costs.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="map-section section-padding">
                <div className="container">
                    <div className="text-center mb-5">
                        <span className="section-tag">Find Us</span>
                        <h2 className="section-title">Visit Our <span className="text-accent">Store</span></h2>
                    </div>
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3915.18606698765!2d77.3474949!3d11.099506300000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba907bc4d943b1d%3A0xdf55e55fc459d433!2s55%2C%20Kulli%20Chettiar%20St%2C%20Kamatchi%20Amman%2C%20Tiruppur%2C%20Tamil%20Nadu%20641604!5e0!3m2!1sen!2sin!4v1767152396227!5m2!1sen!2sin"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Jay Shri Textile Store Location"
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="about-cta section-padding">
                <div className="container">
                    <div className="cta-content">
                        <h2>Visit Our Store in Tiruppur</h2>
                        <p>Experience our collection in person at our Kamaraj Road location</p>
                        <div className="cta-buttons">
                            <a href="tel:09443256412" className="btn btn-primary">
                                <Phone size={20} /> Call Now
                            </a>
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=55+Kulli+Chettiar+Street+Kamaraj+Rd+Tiruppur+Tamil+Nadu+641604"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                <MapPin size={20} /> Get Directions
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet" />
        </main>
    );
};

export default About;