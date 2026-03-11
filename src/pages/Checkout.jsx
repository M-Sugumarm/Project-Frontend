import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Lock, CreditCard, Check, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import './Checkout.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ onSuccess, onOrderDetails }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: ''
    });

    const stripe = useStripe();
    const elements = useElements();
    const { user } = useUser();
    const { cartItems, getCartTotal, clearCart } = useCart();

    const subtotal = getCartTotal();
    const shipping = subtotal > 2999 ? 0 : 99;
    const total = subtotal + shipping;

    // Generate order number
    const generateOrderNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `JST${year}${month}${day}${random}`;
    };

    // Calculate estimated delivery date (5-7 business days)
    const getEstimatedDelivery = () => {
        const today = new Date();
        const minDays = 5;
        const maxDays = 7;

        const minDate = new Date(today);
        minDate.setDate(today.getDate() + minDays);

        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + maxDays);

        const formatDate = (date) => {
            return date.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        };

        return `${formatDate(minDate)} - ${formatDate(maxDate)}`;
    };

    const handleInputChange = (e) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            console.log('Starting payment process...');

            // Validate that all products in cart still exist
            console.log('Validating cart products...');
            try {
                const validationPromises = cartItems.map(item =>
                    api.get(`/products/${item.id}`)
                );
                await Promise.all(validationPromises);
                console.log('All products validated successfully');
            } catch (validationError) {
                throw new Error(
                    'Some items in your cart are no longer available. ' +
                    'Please refresh the page and review your cart.'
                );
            }


            // Create payment intent on backend
            // usage of api.post adds base URL and headers automatically
            const intentResponse = await api.post('/payment/create-intent', {
                amount: total,
                currency: 'inr',
                description: `Order from Jay Shri Textile - ${cartItems.length} items`,
                shipping: {
                    name: shippingInfo.fullName,
                    address: shippingInfo.address,
                    city: shippingInfo.city,
                    state: shippingInfo.state,
                    postalCode: shippingInfo.pincode
                }
            });

            const { clientSecret, error: backendError } = intentResponse.data;

            if (backendError) {
                throw new Error(backendError);
            }

            if (!clientSecret) {
                throw new Error('No client secret received from backend');
            }

            console.log('Confirming payment with Stripe...');

            // Confirm payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: shippingInfo.fullName,
                        email: user?.emailAddresses[0]?.emailAddress,
                        address: {
                            line1: shippingInfo.address,
                            city: shippingInfo.city,
                            state: shippingInfo.state,
                            postal_code: shippingInfo.pincode,
                            country: 'IN'
                        }
                    }
                }
            });

            if (stripeError) {
                console.error('Stripe error:', stripeError);
                throw new Error(stripeError.message);
            }

            if (paymentIntent.status === 'succeeded') {
                console.log('Payment succeeded! Creating order...');

                const orderNumber = generateOrderNumber();
                const estimatedDelivery = getEstimatedDelivery();

                // Create order in backend with items
                try {
                    const orderPayload = {
                        userId: user?.id || 'guest',
                        shippingAddress: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} - ${shippingInfo.pincode}`,
                        stripePaymentId: paymentIntent.id,
                        // Map cart items to backend expectation
                        items: cartItems.map(item => ({
                            id: item.id,
                            quantity: item.quantity,
                            size: item.selectedSize || null,
                            color: item.selectedColor || null
                        }))
                    };

                    const orderResponse = await api.post('/orders', orderPayload);
                    console.log('Order created in backend successfully:', orderResponse.data);
                } catch (orderError) {
                    console.error('Order creation failed:', orderError);
                    // Payment succeeded but order recording failed - this is critical
                    throw new Error(
                        `Payment successful (ID: ${paymentIntent.id}) but order could not be recorded. ` +
                        `Please contact support immediately with this payment ID. ` +
                        `Error: ${orderError.response?.data?.message || orderError.message || 'Unknown error'}`
                    );
                }

                // Store order details for success page
                const orderData = {
                    orderNumber,
                    estimatedDelivery,
                    paymentId: paymentIntent.id,
                    items: [...cartItems],
                    shippingAddress: shippingInfo,
                    total,
                    email: user?.emailAddresses[0]?.emailAddress
                };

                // Pass order details to parent
                onOrderDetails(orderData);

                // Clear cart AFTER storing order details
                clearCart();

                // Set success state in parent
                onSuccess();
            }
        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <div className="checkout-section">
                <h3>Shipping Information</h3>
                <div className="form-grid">
                    <div className="form-group full-width">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={shippingInfo.fullName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group full-width">
                        <label>Address</label>
                        <input
                            type="text"
                            name="address"
                            value={shippingInfo.address}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>City</label>
                        <input
                            type="text"
                            name="city"
                            value={shippingInfo.city}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>State</label>
                        <input
                            type="text"
                            name="state"
                            value={shippingInfo.state}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>PIN Code</label>
                        <input
                            type="text"
                            name="pincode"
                            value={shippingInfo.pincode}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={shippingInfo.phone}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="checkout-section">
                <h3><CreditCard size={20} /> Payment Details</h3>
                <div className="card-element-wrapper">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#000000',
                                    '::placeholder': { color: '#aab7c4' }
                                },
                                invalid: { color: '#ef4444' }
                            }
                        }}
                    />
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="checkout-summary">
                <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                </div>
            </div>

            <button
                type="submit"
                className="btn btn-primary pay-btn"
                disabled={!stripe || loading}
            >
                {loading ? 'Processing...' : (
                    <>
                        <Lock size={18} /> Pay ₹{total.toLocaleString()}
                    </>
                )}
            </button>
        </form>
    );
};

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const [success, setSuccess] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    // Only redirect if cart is empty AND we're not in success mode
    if (cartItems.length === 0 && !success) {
        navigate('/cart');
        return null;
    }

    // Show success page if payment succeeded
    if (success && orderDetails) {
        return (
            <main className="checkout-page">
                <div className="container">
                    <div className="checkout-success">
                        <div className="success-animation">
                            <div className="success-icon">
                                <Check size={64} />
                            </div>
                        </div>

                        <h2>Order Placed Successfully! 🎉</h2>
                        <p className="success-subtitle">
                            Thank you for your purchase! Your order has been confirmed.
                        </p>

                        <div className="order-confirmation-card">
                            <div className="order-header">
                                <div className="order-number">
                                    <span className="label">Order Number</span>
                                    <span className="value">{orderDetails.orderNumber}</span>
                                </div>
                                <div className="order-status">
                                    <span className="status-badge">Confirmed</span>
                                </div>
                            </div>

                            <div className="order-details-grid">
                                <div className="detail-item">
                                    <span className="detail-label">Estimated Delivery</span>
                                    <span className="detail-value">{orderDetails.estimatedDelivery}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Total Amount</span>
                                    <span className="detail-value">₹{orderDetails.total.toLocaleString()}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Items</span>
                                    <span className="detail-value">{orderDetails.items.length} item(s)</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Payment Method</span>
                                    <span className="detail-value">Card Payment</span>
                                </div>
                            </div>

                            <div className="shipping-info-display">
                                <h4>Shipping Address</h4>
                                <p>
                                    {orderDetails.shippingAddress.fullName}<br />
                                    {orderDetails.shippingAddress.address}<br />
                                    {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} - {orderDetails.shippingAddress.pincode}<br />
                                    Phone: {orderDetails.shippingAddress.phone}
                                </p>
                            </div>

                            {orderDetails.email && (
                                <div className="email-confirmation">
                                    <p>
                                        📧 A confirmation email has been sent to <strong>{orderDetails.email}</strong>
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="order-items-summary">
                            <h3>Order Items</h3>
                            <div className="items-list">
                                {orderDetails.items.map(item => (
                                    <div key={item.id} className="success-order-item">
                                        <img src={item.imageUrl} alt={item.name} />
                                        <div className="item-details">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty">Qty: {item.quantity}</span>
                                        </div>
                                        <span className="item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="success-actions">
                            <button className="btn btn-primary" onClick={() => navigate('/')}>
                                Continue Shopping
                            </button>
                            <button className="btn btn-secondary" onClick={() => window.print()}>
                                Print Receipt
                            </button>
                        </div>

                        <div className="next-steps">
                            <h4>What's Next?</h4>
                            <ul>
                                <li>✓ You'll receive an order confirmation email shortly</li>
                                <li>✓ We'll send you tracking details once your order ships</li>
                                <li>✓ Expected delivery: {orderDetails.estimatedDelivery}</li>
                                <li>✓ Contact us at <a href="tel:09443256412">094432 56412</a> for any queries</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <div className="container">
                <button className="back-btn" onClick={() => navigate('/cart')}>
                    <ArrowLeft size={18} /> Back to Cart
                </button>

                <h1>Checkout</h1>

                <div className="checkout-layout">
                    <div className="checkout-main">
                        <Elements stripe={stripePromise}>
                            <CheckoutForm
                                onSuccess={() => setSuccess(true)}
                                onOrderDetails={(details) => setOrderDetails(details)}
                            />
                        </Elements>
                    </div>

                    <div className="checkout-sidebar">
                        <div className="order-items">
                            <h3>Order Summary ({cartItems.length} items)</h3>
                            {cartItems.map(item => (
                                <div key={item.id} className="order-item">
                                    <img src={item.imageUrl} alt={item.name} />
                                    <div className="item-info">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-qty">Qty: {item.quantity}</span>
                                    </div>
                                    <span className="item-price">₹{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Checkout;
