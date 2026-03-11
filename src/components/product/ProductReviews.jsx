import { useState, useEffect } from 'react';
import { Star, Send, User, Clock } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { reviewsApi } from '../../services/api';
import './ProductReviews.css';

const ProductReviews = ({ productId, productName }) => {
    const { user, isSignedIn } = useUser();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        rating: 5,
        comment: ''
    });

    const fetchReviews = async () => {
        if (!productId) return;
        try {
            setLoading(true);
            const response = await reviewsApi.getByProduct(productId);
            setReviews(response.data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isSignedIn || !formData.comment.trim()) return;

        setSubmitting(true);
        try {
            await reviewsApi.addReview({
                productId: String(productId),
                userId: user.id,
                userName: user.fullName || user.firstName || 'Anonymous',
                rating: formData.rating,
                comment: formData.comment.trim()
            });

            setFormData({ rating: 5, comment: '' });
            setShowForm(false);
            fetchReviews(); // Re-fetch list

        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(dateStr));
    };

    return (
        <div className="product-reviews">
            <div className="reviews-header">
                <div className="reviews-summary">
                    <h3>Customer Reviews</h3>
                    {reviews.length > 0 && (
                        <div className="rating-summary">
                            <div className="average-rating">
                                <span className="rating-value">{averageRating}</span>
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i < Math.round(Number(averageRating)) ? "#4f46e5" : "transparent"}
                                            stroke="#4f46e5"
                                        />
                                    ))}
                                </div>
                            </div>
                            <span className="review-count">Based on {reviews.length} reviews</span>
                        </div>
                    )}
                </div>

                {isSignedIn && !showForm && (
                    <button
                        className="btn btn-primary write-review-btn"
                        onClick={() => setShowForm(true)}
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {/* Review Form */}
            {showForm && isSignedIn && (
                <form className="review-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Your Rating</label>
                        <div className="star-rating-input">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star-btn ${star <= formData.rating ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                >
                                    <Star
                                        size={28}
                                        fill={star <= formData.rating ? "#4f46e5" : "transparent"}
                                        stroke="#4f46e5"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Your Review</label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                            placeholder="Share your experience with this product..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting || !formData.comment.trim()}
                        >
                            {submitting ? 'Submitting...' : (
                                <>
                                    <Send size={16} />
                                    Submit Review
                                </>
                            )}
                        </button>
                    </div>
                </form>
            )}

            {!isSignedIn && (
                <div className="login-prompt">
                    <p>Please sign in to write a review</p>
                </div>
            )}

            {/* Reviews List */}
            <div className="reviews-list">
                {loading ? (
                    <div className="reviews-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading reviews...</p>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="no-reviews">
                        <User size={48} />
                        <h4>No reviews yet</h4>
                        <p>Be the first to review this product!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <div className="reviewer-avatar-placeholder">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <span className="reviewer-name">{review.userName}</span>
                                        <div className="review-meta">
                                            <div className="review-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={`star-${i}`}
                                                        size={12}
                                                        fill={i < review.rating ? "#4f46e5" : "transparent"}
                                                        stroke="#4f46e5"
                                                    />
                                                ))}
                                            </div>
                                            <span className="review-date">
                                                <Clock size={12} />
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div >
    );
};

export default ProductReviews;
