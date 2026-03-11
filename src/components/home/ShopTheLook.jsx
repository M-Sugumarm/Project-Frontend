import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { bundlesApi } from '../../services/api';
import './ShopTheLook.css';

const ShopTheLook = () => {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBundles = async () => {
            try {
                const response = await bundlesApi.getAll();
                setBundles(response.data || []);
            } catch (error) {
                console.error('Error fetching bundles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBundles();
    }, []);

    if (loading || bundles.length === 0) return null;

    return (
        <section className="shop-the-look">
            <div className="shop-the-look-header">
                <h2>Shop The Look</h2>
                <p>Curated bundles specially designed by our stylists.</p>
            </div>

            <div className="bundles-grid">
                {bundles.map((bundle, index) => (
                    <motion.div
                        key={bundle.id}
                        className="bundle-card"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <div className="bundle-image-container">
                            <img src={bundle.imageUrl} alt={bundle.name} className="bundle-image" />
                            <div className="bundle-overlay">
                                <span className="bundle-item-count">
                                    {bundle.productIds?.length || 0} Items
                                </span>
                            </div>
                        </div>

                        <div className="bundle-content">
                            <h3>{bundle.name}</h3>
                            <p className="bundle-description">{bundle.description}</p>

                            <div className="bundle-price-row">
                                <span className="bundle-price">₹{bundle.bundlePrice}</span>
                                <span className="bundle-tag">Special Price</span>
                            </div>

                            <button
                                className="shop-bundle-btn"
                                onClick={() => {
                                    // Normally you'd add all to cart or navigate to a dedicated look page
                                    // For now, we'll navigate to the first product to jump-start them, 
                                    // or if we had a dedicated bundle page we'd go there.
                                    // We will navigate to the first product as a simple flow.
                                    if (bundle.productIds && bundle.productIds.length > 0) {
                                        navigate(`/product/${bundle.productIds[0]}`);
                                    }
                                }}
                            >
                                <ShoppingBag size={18} />
                                <span>Shop This Look</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default ShopTheLook;
