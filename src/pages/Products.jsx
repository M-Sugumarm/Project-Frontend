import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, LayoutGrid, ChevronDown, X, Sparkles } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import './Products.css';

import { API_ENDPOINTS } from '../config/api';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState('grid');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const heroRef = useRef(null);

    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        priceRange: '',
        sortBy: 'featured'
    });

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch(API_ENDPOINTS.products);
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Fetch categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(API_ENDPOINTS.categories);
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
    }, []);

    // Animation on mount
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const priceRanges = [
        { label: 'All Prices', value: '' },
        { label: 'Under ₹2,000', value: '0-2000' },
        { label: '₹2,000 - ₹5,000', value: '2000-5000' },
        { label: '₹5,000 - ₹15,000', value: '5000-15000' },
        { label: '₹15,000 - ₹50,000', value: '15000-50000' },
        { label: 'Above ₹50,000', value: '50000-999999' }
    ];

    const sortOptions = [
        { label: 'Featured', value: 'featured' },
        { label: 'Newest First', value: 'newest' },
        { label: 'Price: Low to High', value: 'price-asc' },
        { label: 'Price: High to Low', value: 'price-desc' },
        { label: 'Best Rating', value: 'rating' }
    ];

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (filters.category) {
            result = result.filter(p => {
                const productCatId = String(p.categoryId || (p.category?.id) || '');
                return productCatId === String(filters.category);
            });
        }

        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(Number);
            result = result.filter(p => p.price >= min && p.price <= max);
        }

        switch (filters.sortBy) {
            case 'price-asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                result.sort((a, b) => (b.id || 0) - (a.id || 0));
                break;
            default:
                result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        }

        return result;
    }, [products, searchQuery, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        if (key === 'category') {
            if (value) {
                setSearchParams({ category: value });
            } else {
                setSearchParams({});
            }
        }
    };

    const clearFilters = () => {
        setFilters({ category: '', priceRange: '', sortBy: 'featured' });
        setSearchQuery('');
        setSearchParams({});
    };

    const activeFiltersCount = [filters.category, filters.priceRange, searchQuery].filter(Boolean).length;

    const getCategoryName = (id) => {
        const cat = categories.find(c => c.id === parseInt(id));
        return cat ? cat.name : '';
    };

    // Skeleton loader component
    const ProductSkeleton = () => (
        <div className="product-skeleton">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
                <div className="skeleton-line tag"></div>
                <div className="skeleton-line title"></div>
                <div className="skeleton-line price"></div>
            </div>
        </div>
    );

    return (
        <main className="products-page">
            {/* Enhanced Hero */}
            <section className={`products-hero ${isVisible ? 'animate' : ''}`} ref={heroRef}>
                <div className="hero-bg">
                    <div className="hero-pattern"></div>
                    <div className="hero-gradient"></div>
                </div>
                <div className="container">
                    <div className="hero-content">
                        <span className="hero-tag">
                            <Sparkles size={14} />
                            Explore Our Collection
                        </span>
                        <h1>Our <span className="text-accent">Collection</span></h1>
                        <p>Discover timeless elegance in every thread</p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="products-content">
                <div className="container">
                    {/* Enhanced Toolbar */}
                    <div className={`products-toolbar ${isVisible ? 'animate' : ''}`}>
                        <div className="toolbar-left">
                            {/* Search Box */}
                            <div className="search-box">
                                <Search size={20} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button className="clear-search" onClick={() => setSearchQuery('')}>
                                        <X size={16} />
                                    </button>
                                )}
                                <div className="search-focus-ring"></div>
                            </div>

                            {/* Filter Toggle */}
                            <button
                                className={`filter-toggle ${isFilterOpen ? 'active' : ''}`}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                <SlidersHorizontal size={18} />
                                Filters
                                {activeFiltersCount > 0 && (
                                    <span className="filter-count">{activeFiltersCount}</span>
                                )}
                            </button>
                        </div>

                        <div className="toolbar-right">
                            <span className="results-count">
                                <strong>{filteredProducts.length}</strong> products
                            </span>

                            <div className="view-toggle">
                                <button
                                    className={viewMode === 'grid' ? 'active' : ''}
                                    onClick={() => setViewMode('grid')}
                                    aria-label="Grid view"
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    className={viewMode === 'compact' ? 'active' : ''}
                                    onClick={() => setViewMode('compact')}
                                    aria-label="Compact view"
                                >
                                    <LayoutGrid size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Chips */}
                    {activeFiltersCount > 0 && (
                        <div className="active-filters">
                            {filters.category && (
                                <button
                                    className="filter-chip"
                                    onClick={() => handleFilterChange('category', '')}
                                >
                                    {getCategoryName(filters.category)}
                                    <X size={14} />
                                </button>
                            )}
                            {filters.priceRange && (
                                <button
                                    className="filter-chip"
                                    onClick={() => handleFilterChange('priceRange', '')}
                                >
                                    {priceRanges.find(r => r.value === filters.priceRange)?.label}
                                    <X size={14} />
                                </button>
                            )}
                            {searchQuery && (
                                <button
                                    className="filter-chip"
                                    onClick={() => setSearchQuery('')}
                                >
                                    "{searchQuery}"
                                    <X size={14} />
                                </button>
                            )}
                            <button className="clear-all-chip" onClick={clearFilters}>
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Enhanced Filters Panel */}
                    <div className={`filters-panel ${isFilterOpen ? 'open' : ''}`}>
                        <div className="filter-group">
                            <label>Category</label>
                            <div className="filter-options">
                                <button
                                    className={`filter-option ${filters.category === '' ? 'active' : ''}`}
                                    onClick={() => handleFilterChange('category', '')}
                                >
                                    All
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        className={`filter-option ${filters.category === String(cat.id) ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('category', String(cat.id))}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>Price Range</label>
                            <div className="filter-options">
                                {priceRanges.map(range => (
                                    <button
                                        key={range.value}
                                        className={`filter-option ${filters.priceRange === range.value ? 'active' : ''}`}
                                        onClick={() => handleFilterChange('priceRange', range.value)}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="filter-group">
                            <label>Sort By</label>
                            <div className="select-wrapper">
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    {sortOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <ChevronDown size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="products-grid grid">
                            {[...Array(8)].map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className={`products-grid ${viewMode} ${isVisible ? 'animate' : ''}`}>
                            {filteredProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="product-item"
                                    style={{ '--delay': `${index * 0.05}s` }}
                                >
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <Search size={48} />
                            </div>
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search query</p>
                            <button className="btn btn-primary" onClick={clearFilters}>
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Products;
