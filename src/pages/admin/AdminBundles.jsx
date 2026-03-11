import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, Package, DollarSign } from 'lucide-react';
import { bundlesApi } from '../../services/api';
import api from '../../services/api'; // for products
import Loader from '../../components/common/Loader';
import './AdminLayout.css';
import '../../pages/admin/ProductManagement.css';

const AdminBundles = () => {
    const [bundles, setBundles] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBundle, setCurrentBundle] = useState({
        name: '',
        description: '',
        imageUrl: '',
        bundlePrice: '',
        productIds: []
    });

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bundlesRes, productsRes] = await Promise.all([
                bundlesApi.getAll(),
                api.get('/products')
            ]);
            setBundles(bundlesRes.data || []);
            setProducts(productsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (bundle = null) => {
        if (bundle) {
            setCurrentBundle({ ...bundle });
            setIsEditing(true);
        } else {
            setCurrentBundle({
                name: '',
                description: '',
                imageUrl: '',
                bundlePrice: '',
                productIds: []
            });
            setIsEditing(false);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentBundle({
            name: '',
            description: '',
            imageUrl: '',
            bundlePrice: '',
            productIds: []
        });
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentBundle(prev => ({
            ...prev,
            [name]: name === 'bundlePrice' ? Number(value) : value
        }));
    };

    const toggleProductInBundle = (productId) => {
        setCurrentBundle(prev => {
            const newProductIds = prev.productIds.includes(productId)
                ? prev.productIds.filter(id => id !== productId)
                : [...prev.productIds, productId];
            return { ...prev, productIds: newProductIds };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await bundlesApi.update(currentBundle.id, currentBundle);
            } else {
                await bundlesApi.create(currentBundle);
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error('Error saving bundle:', error);
            alert('Failed to save bundle.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bundle?')) {
            try {
                await bundlesApi.delete(id);
                fetchData();
            } catch (error) {
                console.error('Error deleting bundle:', error);
            }
        }
    };

    const filteredBundles = bundles.filter(bundle =>
        (bundle.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredProducts = products.filter(product =>
        (product.name || '').toLowerCase().includes(productSearchTerm.toLowerCase())
    );

    const getProductNames = (productIds) => {
        if (!productIds || productIds.length === 0) return 'No products selected';
        const names = productIds.map(id => {
            const prod = products.find(p => p.id === id);
            return prod ? prod.name : 'Unknown Product';
        });
        return names.join(', ');
    };

    if (loading) return <Loader />;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Manage Bundles</h1>
                    <p>Create "Shop the Look" packages</p>
                </div>
                <button className="primary-button" onClick={() => handleOpenModal()}>
                    <Plus size={20} />
                    <span>Create Bundle</span>
                </button>
            </div>

            <div className="admin-toolbar">
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search bundles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Bundle Info</th>
                            <th>Included Products</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBundles.map(bundle => (
                            <tr key={bundle.id}>
                                <td>
                                    <div className="product-info-cell">
                                        <img src={bundle.imageUrl || 'https://via.placeholder.com/50'} alt={bundle.name} className="product-thumbnail" />
                                        <div>
                                            <span className="product-name">{bundle.name}</span>
                                            <span className="product-category" style={{ display: 'block', fontSize: '12px' }}>{bundle.description?.substring(0, 30)}...</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ maxWidth: '300px', fontSize: '14px', color: '#666' }}>
                                    {getProductNames(bundle.productIds)}
                                </td>
                                <td>₹{bundle.bundlePrice}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="icon-button edit" onClick={() => handleOpenModal(bundle)}>
                                            <Edit2 size={18} />
                                        </button>
                                        <button className="icon-button delete" onClick={() => handleDelete(bundle.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredBundles.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                                    No bundles found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
                        <div className="modal-header">
                            <h2>{isEditing ? 'Edit Bundle' : 'Create New Bundle'}</h2>
                            <button className="close-button" onClick={handleCloseModal}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Bundle Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={currentBundle.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bundle Price (₹)</label>
                                    <input
                                        type="number"
                                        name="bundlePrice"
                                        value={currentBundle.bundlePrice}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={currentBundle.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Image URL</label>
                                <input
                                    type="text"
                                    name="imageUrl"
                                    value={currentBundle.imageUrl}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Select Products for Bundle</label>
                                <div className="search-bar" style={{ marginBottom: '10px' }}>
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search products to add..."
                                        value={productSearchTerm}
                                        onChange={(e) => setProductSearchTerm(e.target.value)}
                                        style={{ padding: '8px 8px 8px 30px' }}
                                    />
                                </div>
                                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
                                    {filteredProducts.map(product => (
                                        <div key={product.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', padding: '8px', backgroundColor: currentBundle.productIds?.includes(product.id) ? '#f0f9ff' : 'transparent', borderRadius: '4px' }}>
                                            <input
                                                type="checkbox"
                                                checked={currentBundle.productIds?.includes(product.id) || false}
                                                onChange={() => toggleProductInBundle(product.id)}
                                                style={{ marginRight: '10px', width: '18px', height: '18px' }}
                                                id={`prod-${product.id}`}
                                            />
                                            <label htmlFor={`prod-${product.id}`} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flex: 1, margin: 0 }}>
                                                <img src={product.imageUrl} alt="" style={{ width: '30px', height: '30px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }} />
                                                <span style={{ flex: 1 }}>{product.name}</span>
                                                <span style={{ fontWeight: 'bold' }}>₹{product.price}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                                    Selected: {currentBundle.productIds?.length || 0} product(s)
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-button" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="save-button">
                                    {isEditing ? 'Save Changes' : 'Create Bundle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBundles;
