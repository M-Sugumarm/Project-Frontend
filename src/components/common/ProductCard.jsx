import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { resolveProductImage } from '../../utils/smartImage';
import { useReviewCount } from '../../hooks/useReviewCount';
import './ProductCard.css';

// Default fallback image for products without images
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&h=800&fit=crop';

const ProductCard = ({ product, featured = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [justAdded, setJustAdded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const cardRef = useRef(null);
    const { addToCart } = useCart();
    const { count: liveCount, avgRating: liveRating } = useReviewCount(product.id);

    // Use the stored imageUrl directly if it exists (admin set it intentionally)
    // Only fall back to smart resolver when no URL is stored at all
    const storedUrl = product.imageUrl?.trim();
    const resolvedImage = storedUrl && (storedUrl.startsWith('http') || storedUrl.startsWith('data:image/'))
        ? storedUrl
        : resolveProductImage(product.name, product.description, storedUrl);
    const imageUrl = imageError ? FALLBACK_IMAGE : resolvedImage;

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAdding || justAdded) return;

        setIsAdding(true);
        addToCart(product, 1);

        setTimeout(() => {
            setIsAdding(false);
            setJustAdded(true);
            setTimeout(() => setJustAdded(false), 2000);
        }, 500);
    };

    const handleLike = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLiked(!isLiked);
    };

    // 3D Tilt effect
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 25;
        const rotateY = (centerX - x) / 25;

        cardRef.current.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (cardRef.current) {
            cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        }
    };

    return (
        <Link
            to={`/product/${product.id}`}
            ref={cardRef}
            className={`product-card ${featured ? 'featured' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Image Container */}
            <div className="product-image-container">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="product-image"
                    loading="lazy"
                    onError={() => setImageError(true)}
                />

                {/* Image shine effect on hover */}
                <div className="image-shine"></div>

                {/* Overlay */}
                <div className={`product-overlay ${isHovered ? 'visible' : ''}`}>
                    <div className="overlay-actions">
                        <button
                            className={`overlay-btn ${isAdding ? 'loading' : ''} ${justAdded ? 'success' : ''}`}
                            onClick={handleAddToCart}
                            aria-label="Add to cart"
                        >
                            {justAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
                            <span className="btn-ripple"></span>
                        </button>
                        <button className="overlay-btn" aria-label="Quick view">
                            <Eye size={20} />
                        </button>
                        <button
                            className={`overlay-btn heart-btn ${isLiked ? 'liked' : ''}`}
                            onClick={handleLike}
                            aria-label="Add to wishlist"
                        >
                            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>

                {/* Badges */}
                <div className="product-badges">
                    {discount > 0 && (
                        <span className="badge badge-discount">
                            -{discount}%
                        </span>
                    )}
                    {product.isUpcoming && (
                        <span className="badge badge-upcoming">Coming Soon</span>
                    )}
                    {product.isFeatured && !featured && (
                        <span className="badge badge-featured">Featured</span>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                        <span className="badge badge-low-stock">Only {product.stock} left</span>
                    )}
                </div>
            </div>

            {/* Product Info */}
            <div className="product-info">
                <span className="product-category">{product.category?.name || product.category}</span>
                <h3 className="product-name">{product.name}</h3>

                {/* Rating — uses real-time Firestore count */}
                {(liveCount > 0 || product.rating) && (
                    <div className="product-rating">
                        <div className="stars">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    fill={i < Math.floor(liveRating ?? product.rating ?? 0) ? "#4f46e5" : "transparent"}
                                    stroke="#4f46e5"
                                />
                            ))}
                        </div>
                        <span className="rating-value">
                            {liveRating != null ? liveRating : Number(product.rating ?? 0).toFixed(1)}
                        </span>
                        <span className="rating-count">
                            ({liveCount != null ? liveCount : (product.reviews ?? 0)})
                        </span>
                    </div>
                )}

                {/* Price */}
                <div className="product-price">
                    <span className="current-price">₹{product.price?.toLocaleString()}</span>
                    {product.originalPrice && (
                        <span className="original-price">₹{product.originalPrice?.toLocaleString()}</span>
                    )}
                </div>

                {/* Quick Add Button */}
                <button
                    className={`quick-add-btn ${isAdding ? 'loading' : ''} ${justAdded ? 'success' : ''}`}
                    onClick={handleAddToCart}
                >
                    {justAdded ? (
                        <>
                            <Check size={16} />
                            Added!
                        </>
                    ) : isAdding ? (
                        <>
                            <span className="spinner"></span>
                            Adding...
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={16} />
                            Add to Cart
                        </>
                    )}
                </button>
            </div>

            {/* Card glow effect */}
            <div className="card-glow-effect"></div>
        </Link>
    );
};

export default ProductCard;
