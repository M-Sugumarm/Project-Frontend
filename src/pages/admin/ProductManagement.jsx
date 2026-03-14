import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, X, Package, Megaphone, Upload, Image as ImageIcon } from 'lucide-react';
import Loader from '../../components/common/Loader';
import './ProductManagement.css';

import { API_ENDPOINTS } from '../../config/api';

import { broadcastApi } from '../../services/api';

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState(null);

    // Broadcast state
    const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
    const [sendingBroadcast, setSendingBroadcast] = useState(false);
    const [broadcastData, setBroadcastData] = useState({
        offerType: 'DISCOUNT_10',
        title: '',
        message: '',
        promoCode: ''
    });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        stock: '',
        categoryId: '',
        imageUrl: '',
        isFeatured: false,
        isUpcoming: false,
        sizes: '',
        colors: '',
        material: '',
        brand: 'Jay Shri Textile'
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.imageUrl;
        
        setUploading(true);
        try {
            const uploadData = new FormData();
            uploadData.append('file', imageFile);

            const response = await fetch(`${API_ENDPOINTS.products.replace('/products', '/files/upload')}`, {
                method: 'POST',
                body: uploadData
            });

            if (!response.ok) throw new Error('Failed to upload image');
            const data = await response.json();
            return data.url;
        } catch (err) {
            console.error('Upload error:', err);
            throw new Error('Image upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    // Fetch products
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

    // Fetch categories
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

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const filteredProducts = products.filter(p => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch = !query ||
            p.name?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query) ||
            p.brand?.toLowerCase().includes(query) ||
            p.material?.toLowerCase().includes(query);
        const matchesCategory = !selectedCategory ||
            String(p.categoryId) === String(selectedCategory) ||
            String(p.category?.id) === String(selectedCategory);
        return matchesSearch && matchesCategory;
    });

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await fetch(API_ENDPOINTS.productById(id), {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete product');
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert('Error deleting product: ' + err.message);
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            originalPrice: product.originalPrice || '',
            stock: product.stock || '',
            categoryId: product.category?.id || product.categoryId || '',
            imageUrl: product.imageUrl || '',
            isFeatured: product.isFeatured || product.featured || false,
            isUpcoming: product.isUpcoming || product.upcoming || false,
            sizes: product.sizes || '',
            colors: product.colors || '',
            material: product.material || '',
            brand: product.brand || 'Jay Shri Textile'
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            originalPrice: '',
            stock: '',
            categoryId: '', // Empty string to force user selection
            imageUrl: '',
            isFeatured: false,
            isUpcoming: false,
            sizes: 'Free Size',
            colors: '',
            material: '',
            brand: 'Jay Shri Textile'
        });
        setIsModalOpen(true);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            let finalImageUrl = formData.imageUrl;
            
            if (imageFile) {
                finalImageUrl = await uploadImage();
            }

            const productData = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
                stock: parseInt(formData.stock),
                categoryId: formData.categoryId ? String(formData.categoryId) : null,  // Must be String to match Firestore
                imageUrl: finalImageUrl || null,
                isFeatured: formData.isFeatured,
                isUpcoming: formData.isUpcoming,
                sizes: formData.sizes,
                colors: formData.colors,
                material: formData.material,
                brand: formData.brand,
                rating: editingProduct?.rating || 0,
                reviews: editingProduct?.reviews || 0
            };

            let url, method;

            if (editingProduct) {
                // For editing: PUT /api/products/{id} — categoryId is in the JSON body, NOT query param
                url = API_ENDPOINTS.productById(editingProduct.id);
                method = 'PUT';
            } else {
                // For adding: POST with categoryId in query param (backend requires this for new products)
                url = `${API_ENDPOINTS.products}${formData.categoryId ? `?categoryId=${formData.categoryId}` : ''}`;
                method = 'POST';
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to save product: ${errorText}`);
            }

            const savedProduct = await response.json();

            if (editingProduct) {
                setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
            } else {
                setProducts([...products, savedProduct]);
            }

            setIsModalOpen(false);
            setEditingProduct(null);
        } catch (err) {
            alert('Error saving product: ' + err.message);
            console.error('Save error:', err);
        } finally {
            setSaving(false);
        }
    };

    const getCategoryName = (product) => {
        return product.category?.name ||
            categories.find(c => c.id === product.categoryId)?.name ||
            'Unknown';
    };

    const handleBroadcastSubmit = async (e) => {
        e.preventDefault();
        setSendingBroadcast(true);
        try {
            await broadcastApi.send(broadcastData);
            alert('Broadcast sent successfully! Emails are being dispatched to all subscribers.');
            setIsBroadcastModalOpen(false);
            setBroadcastData({ offerType: 'DISCOUNT_10', title: '', message: '', promoCode: '' });
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to send broadcast';
            alert('Error sending broadcast: ' + errorMessage);
        } finally {
            setSendingBroadcast(false);
        }
    };

    if (loading) {
        return <Loader size="lg" text="Loading products..." />;
    }

    return (
        <div className="product-management">
            <div className="page-header">
                <div>
                    <h1>Product Management</h1>
                    <p>Manage your product catalog ({products.length} products)</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={fetchProducts}>
                        <RefreshCw size={18} /> Refresh
                    </button>
                    <button
                        className="btn btn-broadcast"
                        onClick={() => setIsBroadcastModalOpen(true)}
                        title="Send offers to all matched email subscribers"
                    >
                        <Megaphone size={18} /> Send Broadcast Offer
                    </button>
                    <button className="btn btn-primary" onClick={handleAdd}>
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Table */}
            {filteredProducts.length === 0 ? (
                <div className="empty-state">
                    <h3>No Products Found</h3>
                    <p>
                        {products.length === 0
                            ? "Start by adding your first product!"
                            : "No products match your search criteria."}
                    </p>
                    {products.length === 0 && (
                        <button className="btn btn-primary" onClick={handleAdd}>
                            <Plus size={18} /> Add First Product
                        </button>
                    )}
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="product-cell">
                                            <img
                                                src={product.imageUrl || 'https://placehold.co/100x100/1a1a1a/d4af37?text=No+Image'}
                                                alt={product.name}
                                            />
                                            <div>
                                                <span className="product-name">{product.name}</span>
                                                <span className="product-id">ID: {product.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{getCategoryName(product)}</td>
                                    <td>
                                        <span className="price">₹{product.price?.toLocaleString()}</span>
                                        {product.originalPrice && (
                                            <span className="original-price">₹{product.originalPrice.toLocaleString()}</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`stock ${product.stock <= 10 ? 'low' : ''}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status ${product.isFeatured || product.featured ? 'featured' : 'active'}`}>
                                            {product.isFeatured || product.featured ? 'Featured' : 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                className="action-btn view"
                                                title="View"
                                                onClick={() => window.open(`/product/${product.id}`, '_blank')}
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button
                                                className="action-btn edit"
                                                title="Edit"
                                                onClick={() => handleEdit(product)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                title="Delete"
                                                onClick={() => handleDelete(product.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Product Modal - Rendered via Portal for proper centering */}
            {isModalOpen && createPortal(
                <div className="product-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="product-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="product-modal-header">
                            <div className="product-modal-title">
                                <Package size={24} />
                                <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            </div>
                            <button
                                className="product-modal-close"
                                onClick={() => setIsModalOpen(false)}
                                type="button"
                                aria-label="Close modal"
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <form className="product-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price (₹) *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Original Price (₹)</label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={(e) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                categoryId: e.target.value
                                            }));
                                        }}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Stock *</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    rows="3"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Product description"
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>Product Image</label>
                                <div className="image-upload-section">
                                    <div className="image-preview-large">
                                        {imagePreview || formData.imageUrl ? (
                                            <div className="preview-container">
                                                <img 
                                                    src={imagePreview || formData.imageUrl} 
                                                    alt="Product Preview" 
                                                />
                                                <button 
                                                    type="button" 
                                                    className="remove-image"
                                                    onClick={() => {
                                                        setImageFile(null);
                                                        setImagePreview(null);
                                                        setFormData(prev => ({ ...prev, imageUrl: '' }));
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="upload-placeholder" onClick={() => document.getElementById('product-image-upload').click()}>
                                                <Upload size={32} />
                                                <span>Click to upload image</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="upload-controls">
                                        <div className="file-input-wrapper">
                                            <input
                                                id="product-image-upload"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden-file-input"
                                            />
                                            <button 
                                                type="button" 
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => document.getElementById('product-image-upload').click()}
                                            >
                                                <ImageIcon size={16} /> {imageFile ? 'Change Image' : 'Select Local File'}
                                            </button>
                                        </div>
                                        
                                        <div className="url-input-wrapper">
                                            <input
                                                type="text"
                                                name="imageUrl"
                                                value={formData.imageUrl}
                                                onChange={handleInputChange}
                                                placeholder="Or paste external image URL"
                                                className="url-input"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {uploading && (
                                    <div className="upload-status">
                                        <RefreshCw size={14} className="spin" />
                                        <span>Uploading to cloud storage...</span>
                                    </div>
                                )}
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Sizes (comma-separated)</label>
                                    <input
                                        type="text"
                                        name="sizes"
                                        value={formData.sizes}
                                        onChange={handleInputChange}
                                        placeholder="S, M, L, XL or Free Size"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Colors (comma-separated)</label>
                                    <input
                                        type="text"
                                        name="colors"
                                        value={formData.colors}
                                        onChange={handleInputChange}
                                        placeholder="Red, Blue, Green"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Material</label>
                                    <input
                                        type="text"
                                        name="material"
                                        value={formData.material}
                                        onChange={handleInputChange}
                                        placeholder="Pure Silk, Cotton, etc."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Brand</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                        placeholder="Jay Shri Textile"
                                    />
                                </div>
                            </div>
                            <div className="form-row checkboxes">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isFeatured"
                                        checked={formData.isFeatured}
                                        onChange={handleInputChange}
                                    />
                                    Featured Product
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isUpcoming"
                                        checked={formData.isUpcoming}
                                        onChange={handleInputChange}
                                    />
                                    Upcoming Product
                                </label>
                            </div>
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Broadcast Modal - Rendered via Portal */}
            {isBroadcastModalOpen && createPortal(
                <div className="product-modal-overlay" onClick={() => !sendingBroadcast && setIsBroadcastModalOpen(false)}>
                    <div className="product-modal broadcast-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="product-modal-header broadcast-header">
                            <div className="product-modal-title">
                                <span className="broadcast-icon-pulse">📢</span>
                                <h2>Broadcast Offer</h2>
                            </div>
                            <button
                                className="product-modal-close"
                                onClick={() => !sendingBroadcast && setIsBroadcastModalOpen(false)}
                                type="button"
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <form className="product-form" onSubmit={handleBroadcastSubmit}>
                            <p className="broadcast-info">
                                Send an attractive HTML email offer instantly to all users who are subscribed to your newsletter.
                            </p>

                            <div className="form-group">
                                <label>Offer Type *</label>
                                <select
                                    value={broadcastData.offerType}
                                    onChange={(e) => setBroadcastData({ ...broadcastData, offerType: e.target.value })}
                                    required
                                >
                                    <option value="DISCOUNT_10">Flat 10% OFF Sale</option>
                                    <option value="DISCOUNT_20">Flat 20% OFF Sale</option>
                                    <option value="OCCASION">Special Occasion / Festival</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Email Subject Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., The Big Diwali Sale is Here!"
                                    value={broadcastData.title}
                                    onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Promo Code (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g., DIWALI20"
                                    value={broadcastData.promoCode}
                                    onChange={(e) => setBroadcastData({ ...broadcastData, promoCode: e.target.value.toUpperCase() })}
                                />
                                <small style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                                    This will be rendered prominently inside a dashed ticket box.
                                </small>
                            </div>

                            <div className="form-group">
                                <label>Custom Message *</label>
                                <textarea
                                    rows="4"
                                    placeholder="Type your warm greetings or details about the sale..."
                                    value={broadcastData.message}
                                    onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                                    required
                                ></textarea>
                            </div>

                            <div className="form-actions" style={{ marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setIsBroadcastModalOpen(false)}
                                    disabled={sendingBroadcast}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-broadcast-submit"
                                    disabled={sendingBroadcast}
                                >
                                    {sendingBroadcast ? 'Sending to Subscribers...' : 'Send Broadcast Email ✨'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ProductManagement;
