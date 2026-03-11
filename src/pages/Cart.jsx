import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const subtotal = getCartTotal();
    const shipping = subtotal > 2999 ? 0 : 99;
    const total = subtotal + shipping;

    if (cartItems.length === 0) {
        return (
            <main className="cart-page empty-cart">
                <div className="container">
                    <div className="empty-state">
                        <ShoppingBag size={80} className="empty-icon" />
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added anything to your cart yet.</p>
                        <Link to="/products" className="btn btn-primary">
                            Start Shopping <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="cart-page">
            <div className="container">
                <div className="cart-header">
                    <h1>Shopping <span className="text-accent">Cart</span></h1>
                    <button className="clear-cart-btn" onClick={clearCart}>
                        <Trash2 size={16} /> Clear Cart
                    </button>
                </div>

                <div className="cart-layout">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item">
                                <Link to={`/product/${item.id}`} className="item-image">
                                    <img src={item.imageUrl} alt={item.name} />
                                </Link>

                                <div className="item-details">
                                    <Link to={`/product/${item.id}`} className="item-name">
                                        {item.name}
                                    </Link>
                                    <p className="item-category">{item.category}</p>
                                    {item.selectedColor && (
                                        <p className="item-variant">Color: {item.selectedColor}</p>
                                    )}
                                    {item.selectedSize && (
                                        <p className="item-variant">Size: {item.selectedSize}</p>
                                    )}
                                </div>

                                <div className="item-quantity">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                        <Minus size={16} />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <Plus size={16} />
                                    </button>
                                </div>

                                <div className="item-price">
                                    <span className="price">₹{(item.price * item.quantity).toLocaleString()}</span>
                                    {item.quantity > 1 && (
                                        <span className="unit-price">₹{item.price.toLocaleString()} each</span>
                                    )}
                                </div>

                                <button
                                    className="remove-btn"
                                    onClick={() => removeFromCart(item.id)}
                                    aria-label="Remove item"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <div className="summary-card">
                            <h3>Order Summary</h3>

                            <div className="summary-row">
                                <span>Subtotal ({cartItems.length} items)</span>
                                <span>₹{subtotal.toLocaleString()}</span>
                            </div>

                            <div className="summary-row">
                                <span>Shipping</span>
                                <span className={shipping === 0 ? 'free' : ''}>
                                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                </span>
                            </div>

                            {subtotal < 2999 && (
                                <div className="shipping-note">
                                    <Tag size={14} />
                                    Add ₹{(2999 - subtotal).toLocaleString()} more for free shipping
                                </div>
                            )}

                            <div className="summary-divider"></div>

                            <div className="summary-row total">
                                <span>Total</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>

                            <Link to="/checkout" className="btn btn-primary checkout-btn">
                                Proceed to Checkout <ArrowRight size={18} />
                            </Link>

                            <Link to="/products" className="continue-shopping">
                                Continue Shopping
                            </Link>
                        </div>

                        <div className="secure-badge">
                            🔒 Secure checkout powered by Stripe
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Cart;
