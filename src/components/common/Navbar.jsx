import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ShoppingCart, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from 'framer-motion';
import { useIsAdmin } from '../../components/auth/AdminProtectedRoute';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const { isSignedIn } = useUser();
    const { isAdmin } = useIsAdmin();

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
        setSearchOpen(false);
    }, [location]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const isActive = (path) => location.pathname === path;

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/products', label: 'Collection' },
        { path: '/about', label: 'About' }
    ];

    if (isSignedIn) {
        navLinks.push({ path: '/my-orders', label: 'Orders' });
    }

    if (isAdmin) {
        navLinks.push({ path: '/admin', label: 'Admin Panel', icon: LayoutDashboard });
    }

    return (
        <motion.nav
            className={`navbar ${scrolled ? 'scrolled' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <ShoppingBag className="logo-icon" />
                    </motion.div>
                    <span className="logo-text">Jay Shri Textile</span>
                </Link>

                <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
                    {navLinks.map((link) => (
                        <div key={link.path} className="nav-item">
                            <Link
                                to={link.path}
                                className={`nav-link ${isActive(link.path) ? 'active' : ''} ${link.path === '/admin' ? 'admin-link' : ''}`}
                            >
                                {link.icon && <link.icon size={16} className="inline-icon" style={{ marginRight: '6px', marginBottom: '2px' }} />}
                                {link.label}
                                {isActive(link.path) && (
                                    <motion.div
                                        className="active-indicator"
                                        layoutId="activeIndicator"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="nav-actions">
                    <div className="search-container">
                        <AnimatePresence>
                            {searchOpen && (
                                <motion.form
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: 200, opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    onSubmit={handleSearchSubmit}
                                    className="search-form"
                                >
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                        className="search-input"
                                    />
                                </motion.form>
                            )}
                        </AnimatePresence>
                        <motion.button
                            className={`nav-icon-btn ${searchOpen ? 'active' : ''}`}
                            aria-label="Search"
                            onClick={() => setSearchOpen(!searchOpen)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {searchOpen ? <X size={20} /> : <Search size={20} />}
                        </motion.button>
                    </div>

                    <Link to="/cart" className="nav-icon-btn-wrapper" aria-label="Cart">
                        <motion.div
                            className="nav-icon-btn"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <ShoppingCart size={20} />
                            <AnimatePresence>
                                {cartCount > 0 && (
                                    <motion.span
                                        className="cart-count"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        key={cartCount} // Re-animate on count change
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </Link>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <motion.button
                                className="nav-icon-btn"
                                aria-label="Sign In"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <User size={20} />
                            </motion.button>
                        </SignInButton>
                    </SignedOut>

                    <SignedIn>
                        <UserButton
                            afterSignOutUrl="/"
                            appearance={{
                                elements: {
                                    avatarBox: "w-9 h-9 rounded-full border-2 border-indigo-100 hover:border-indigo-500 transition-colors"
                                }
                            }}
                        />
                    </SignedIn>

                    <motion.button
                        className={`mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu"
                        whileTap={{ scale: 0.9 }}
                    >
                        <motion.span
                            className="bar"
                            animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 8 : 0 }}
                        />
                        <motion.span
                            className="bar"
                            animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
                        />
                        <motion.span
                            className="bar"
                            animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -8 : 0 }}
                        />
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        className="mobile-menu-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <motion.div
                            className="mobile-menu-content"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mobile-menu-header">
                                <span className="mobile-menu-title">Menu</span>
                                <motion.button
                                    className="close-btn"
                                    onClick={() => setMobileMenuOpen(false)}
                                    whileHover={{ rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X size={24} />
                                </motion.button>
                            </div>

                            <div className="mobile-nav-links">
                                {navLinks.map((link, i) => (
                                    <motion.div
                                        key={link.path}
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Link
                                            to={link.path}
                                            className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {link.icon && <link.icon size={18} />}
                                                {link.label}
                                            </span>
                                            <ArrowRight size={16} className="arrow-icon" />
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
