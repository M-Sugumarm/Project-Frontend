import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Share2, Check, Truck, RotateCcw, Shield, Star, Minus, Plus, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/common/ProductCard';
import ProductReviews from '../components/product/ProductReviews';
import { resolveProductImage } from '../utils/smartImage';
import { useReviewCount } from '../hooks/useReviewCount';
import './ProductDetails.css';

import { API_ENDPOINTS } from '../config/api';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isLiked, setIsLiked] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const { count: liveCount, avgRating: liveRating } = useReviewCount(product?.id ?? id);

    // Fetch product from API
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(API_ENDPOINTS.productById(id));
                if (!response.ok) throw new Error('Product not found');
                const data = await response.json();
                setProduct(data);

                // Set default selections
                if (data.sizes) {
                    const sizesArray = typeof data.sizes === 'string' ? data.sizes.split(',') : data.sizes;
                    setSelectedSize(sizesArray[0]?.trim() || '');
                }
                if (data.colors) {
                    const colorsArray = typeof data.colors === 'string' ? data.colors.split(',') : data.colors;
                    setSelectedColor(colorsArray[0]?.trim() || '');
                }

                // Fetch related products
                const allProductsRes = await fetch(API_ENDPOINTS.products);
                if (allProductsRes.ok) {
                    const allProducts = await allProductsRes.json();
                    const categoryId = data.category?.id || data.categoryId;
                    const related = allProducts
                        .filter(p => (p.category?.id === categoryId || p.categoryId === categoryId) && p.id !== data.id)
                        .slice(0, 4);
                    setRelatedProducts(related);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching product:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <main className="product-details-page">
                <div className="container">
                    <div className="loading-state">Loading product details...</div>
                </div>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="product-details-page">
                <div className="container">
                    <div className="error-state">
                        <h2>Product Not Found</h2>
                        <p>The product you're looking for doesn't exist or has been removed.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/products')}>
                            Browse Products
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    // Parse sizes and colors if they're strings
    const sizesArray = typeof product.sizes === 'string' ? product.sizes.split(',').map(s => s.trim()) : (product.sizes || []);
    const colorsArray = typeof product.colors === 'string' ? product.colors.split(',').map(c => c.trim()) : (product.colors || []);

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const handleAddToCart = () => {
        addToCart({ ...product, selectedSize, selectedColor }, quantity);
    };

    const categoryName = product.category?.name || product.category || 'Unknown';

    return (
        <main className="product-details-page">
            {/* Breadcrumb */}
            <div className="breadcrumb">
                <div className="container">
                    <Link to="/">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/products">Products</Link>
                    <ChevronRight size={14} />
                    <span>{product.name}</span>
                </div>
            </div>

            {/* Product Section */}
            <section className="product-section">
                <div className="container">
                    <div className="product-layout">
                        {/* Image Gallery */}
                        <div className="product-gallery">
                            <div className="main-image">
                                <img
                                    src={product.imageUrl?.startsWith('http') || product.imageUrl?.startsWith('data:image/') ? product.imageUrl : resolveProductImage(product.name, product.description, product.imageUrl)}
                                    alt={product.name}
                                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=800&fit=crop'; }}
                                />
                                {discount > 0 && (
                                    <span className="discount-badge">-{discount}%</span>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="product-info">
                            <div className="product-meta">
                                <span className="product-brand">{product.brand || 'Jay Shri Textile'}</span>
                                <div className="product-rating">
                                    <Star size={16} fill="#4f46e5" stroke="#4f46e5" />
                                    <span>{liveRating != null ? liveRating : Number(product.rating || 0).toFixed(1)}</span>
                                    <span className="rating-count">({liveCount != null ? liveCount : (product.reviews || 0)} reviews)</span>
                                </div>
                            </div>

                            <h1 className="product-title">{product.name}</h1>

                            <div className="product-pricing">
                                <span className="current-price">₹{product.price?.toLocaleString()}</span>
                                {product.originalPrice && (
                                    <>
                                        <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                                        <span className="savings">You save ₹{(product.originalPrice - product.price).toLocaleString()}</span>
                                    </>
                                )}
                            </div>

                            <p className="product-description">{product.description}</p>

                            {/* Color Selection */}
                            {colorsArray.length > 0 && (
                                <div className="option-group">
                                    <label>Color: <strong>{selectedColor}</strong></label>
                                    <div className="color-options">
                                        {colorsArray.map(color => (
                                            <button
                                                key={color}
                                                className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                                                onClick={() => setSelectedColor(color)}
                                            >
                                                {color}
                                                {selectedColor === color && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            {sizesArray.length > 1 && (
                                <div className="option-group">
                                    <label>Size: <strong>{selectedSize}</strong></label>
                                    <div className="size-options">
                                        {sizesArray.map(size => (
                                            <button
                                                key={size}
                                                className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div className="option-group">
                                <label>Quantity:</label>
                                <div className="quantity-selector">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                                        <Minus size={18} />
                                    </button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)}>
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className="stock-status">
                                {product.stock > 10 ? (
                                    <span className="in-stock"><Check size={16} /> In Stock</span>
                                ) : product.stock > 0 ? (
                                    <span className="low-stock">Only {product.stock} left!</span>
                                ) : (
                                    <span className="out-of-stock">Out of Stock</span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="product-actions">
                                <button className="btn btn-primary add-to-cart" onClick={handleAddToCart} style={{ width: '100%' }}>
                                    <ShoppingCart size={20} />
                                    Add to Cart
                                </button>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <button
                                        className={`btn btn-secondary wishlist-btn ${isLiked ? 'liked' : ''}`}
                                        onClick={() => setIsLiked(!isLiked)}
                                        style={{ flex: 1 }}
                                    >
                                        <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                                    </button>
                                    <button className="btn btn-secondary share-btn" style={{ flex: 1 }}>
                                        <Share2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Features */}
                            <div className="product-features">
                                <div className="feature">
                                    <Truck size={20} />
                                    <div>
                                        <strong>Free Shipping</strong>
                                        <span>On orders above ₹2,999</span>
                                    </div>
                                </div>
                                <div className="feature">
                                    <RotateCcw size={20} />
                                    <div>
                                        <strong>Easy Returns</strong>
                                        <span>15 days return policy</span>
                                    </div>
                                </div>
                                <div className="feature">
                                    <Shield size={20} />
                                    <div>
                                        <strong>Authentic</strong>
                                        <span>100% genuine product</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <section className="tabs-section">
                <div className="container">
                    <div className="tabs-header">
                        <button
                            className={activeTab === 'description' ? 'active' : ''}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={activeTab === 'details' ? 'active' : ''}
                            onClick={() => setActiveTab('details')}
                        >
                            Details
                        </button>
                        <button
                            className={activeTab === 'reviews' ? 'active' : ''}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews ({liveCount != null ? liveCount : (product.reviews || 0)})
                        </button>
                    </div>

                    <div className="tabs-content">
                        {activeTab === 'description' && (
                            <div className="tab-panel">
                                <h3>Product Description</h3>
                                <p>{product.description}</p>
                                <p>Each piece is meticulously crafted by skilled artisans who have inherited the art of traditional weaving. The intricate patterns and vibrant colors reflect the rich cultural heritage of India.</p>
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <div className="tab-panel">
                                <h3>Product Details</h3>
                                <table className="details-table">
                                    <tbody>
                                        <tr><td>Material</td><td>{product.material || 'N/A'}</td></tr>
                                        <tr><td>Brand</td><td>{product.brand || 'Jay Shri Textile'}</td></tr>
                                        <tr><td>Category</td><td>{categoryName}</td></tr>
                                        <tr><td>Available Sizes</td><td>{sizesArray.join(', ') || 'N/A'}</td></tr>
                                        <tr><td>Available Colors</td><td>{colorsArray.join(', ') || 'N/A'}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="tab-panel">
                                <ProductReviews
                                    productId={product.id}
                                    productName={product.name}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="related-section section">
                    <div className="container">
                        <h2>You May Also Like</h2>
                        <div className="related-grid">
                            {relatedProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </main>
    );
};

export default ProductDetails;
