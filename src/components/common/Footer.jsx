import { Link } from 'react-router-dom';
import { Crown, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            {/* Main Footer */}
            <div className="footer-main">
                <div className="container">
                    <div className="footer-grid">
                        {/* Brand Column */}
                        <div className="footer-brand">
                            <Link to="/" className="footer-logo">
                                <Crown className="footer-logo-icon" />
                                <span className="footer-logo-text">
                                    <span>Jay Shree</span>Textiles
                                </span>
                            </Link>
                            <p className="footer-description">
                                Celebrating the artistry of Indian textiles for 17 years.
                                We bring you the finest handcrafted fabrics from Tiruppur, Tamil Nadu.
                            </p>
                            <div className="footer-social">
                                <a href="#" className="social-link" aria-label="Facebook">
                                    <Facebook size={20} />
                                </a>
                                <a href="#" className="social-link" aria-label="Instagram">
                                    <Instagram size={20} />
                                </a>
                                <a href="#" className="social-link" aria-label="Twitter">
                                    <Twitter size={20} />
                                </a>
                                <a href="#" className="social-link" aria-label="YouTube">
                                    <Youtube size={20} />
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-links">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><Link to="/">Home</Link></li>
                                <li><Link to="/products">Collections</Link></li>
                                <li><Link to="/categories">Categories</Link></li>
                                <li><Link to="/about">About Us</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                            </ul>
                        </div>

                        {/* Categories */}
                        <div className="footer-links">
                            <h4>Categories</h4>
                            <ul>
                                <li><Link to="/products?category=sarees">Sarees</Link></li>
                                <li><Link to="/products?category=lehengas">Lehengas</Link></li>
                                <li><Link to="/products?category=kurtas">Kurtas</Link></li>
                                <li><Link to="/products?category=suits">Suits</Link></li>
                                <li><Link to="/products?category=bridal">Bridal Collection</Link></li>
                            </ul>
                        </div>

                        {/* Customer Service */}
                        <div className="footer-links">
                            <h4>Customer Service</h4>
                            <ul>
                                <li><Link to="/track-order">Track Order</Link></li>
                                <li><Link to="/returns">Returns & Exchanges</Link></li>
                                <li><Link to="/shipping">Shipping Info</Link></li>
                                <li><Link to="/faq">FAQs</Link></li>
                                <li><Link to="/size-guide">Size Guide</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="footer-contact">
                            <h4>Get in Touch</h4>
                            <ul>
                                <li>
                                    <MapPin size={18} />
                                    <span>55, Kulli Chettiar Street, Kamaraj Rd, Tiruppur, Tamil Nadu 641604</span>
                                </li>
                                <li>
                                    <Phone size={18} />
                                    <span>094432 56412</span>
                                </li>
                                <li>
                                    <Mail size={18} />
                                    <span>info@jayshritextile.com</span>
                                </li>
                                <li>
                                    <span style={{ marginLeft: '26px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Open · Closes 8 PM</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <div className="container">
                    <div className="footer-bottom-content">
                        <p>&copy; {currentYear} Jay Shree Textiles. All rights reserved.</p>
                        <div className="footer-legal">
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                            <Link to="/cookies">Cookie Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
