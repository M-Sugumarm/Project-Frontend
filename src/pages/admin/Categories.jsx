import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Edit, Trash2, X, Tag, Image as ImageIcon } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import Loader from '../../components/common/Loader';
import './Categories.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: ''
    });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            // Using fetch directly to match ProductManagement approach which is known to work
            const response = await fetch(API_ENDPOINTS.categories);
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            console.log('Categories fetched:', data);
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback for debugging - remove later
            if (error.response) {
                console.error('Error Status:', error.response.status);
                console.error('Error Data:', error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name || '',
            description: category.description || '',
            imageUrl: category.imageUrl || ''
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
            imageUrl: ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category? Products in this category may be affected.')) return;

        try {
            const response = await fetch(API_ENDPOINTS.categoryById(id), {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete category');
            setCategories(categories.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            let url, method;

            if (editingCategory) {
                url = API_ENDPOINTS.categoryById(editingCategory.id);
                method = 'PUT';
            } else {
                url = API_ENDPOINTS.categories;
                method = 'POST';
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save category');

            const savedCategory = await response.json();

            if (editingCategory) {
                setCategories(categories.map(c => c.id === editingCategory.id ? savedCategory : c));
            } else {
                setCategories([...categories, savedCategory]);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <Loader size="lg" text="Loading categories..." />;
    }

    return (
        <div className="categories-page">
            <div className="page-header">
                <div>
                    <h1>Categories</h1>
                    <p>Manage product categories ({categories.length})</p>
                </div>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} /> Add Category
                </button>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories Table */}
            {filteredCategories.length === 0 ? (
                <div className="empty-state">
                    <Tag size={48} />
                    <h3>No Categories Found</h3>
                    <p>Try adjusting your search or add a new category.</p>
                    {searchQuery === '' && categories.length === 0 && (
                        <button
                            className="btn btn-secondary"
                            style={{ marginTop: '1rem' }}
                            onClick={async () => {
                                if (!window.confirm('This will add 10 default categories to the database. Continue?')) return;
                                setLoading(true);
                                try {
                                    const defaultCategories = [
                                        { name: "Sarees", description: "Elegant drapes for every occasion", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop" },
                                        { name: "Kurtas", description: "Traditional comfort meets style", imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=600&fit=crop" },
                                        { name: "Lehengas", description: "Bridal & festive collections", imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=600&fit=crop" },
                                        { name: "Dupattas", description: "Complete your ethnic look", imageUrl: "https://images.unsplash.com/photo-1617627143233-46e3ba0e97c5?w=800&h=600&fit=crop" },
                                        { name: "Suits", description: "Salwar suits & dress materials", imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=600&fit=crop" },
                                        { name: "Fusion Wear", description: "Modern ethnic combinations", imageUrl: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&h=600&fit=crop" },
                                        { name: "Silk", description: "Pure silk collection", imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=600&fit=crop" },
                                        { name: "Bridal", description: "Wedding collection", imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=600&fit=crop" },
                                        { name: "Mens", description: "Ethnic wear for men", imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=600&fit=crop" },
                                        { name: "Ethnic", description: "Traditional ethnic wear", imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=600&fit=crop" }
                                    ];

                                    for (const cat of defaultCategories) {
                                        await fetch(API_ENDPOINTS.categories, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify(cat)
                                        });
                                    }
                                    await fetchCategories();
                                    alert('Default categories added successfully!');
                                } catch (error) {
                                    console.error('Error seeding categories:', error);
                                    alert('Failed to seed categories');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        >
                            Initialize Default Categories
                        </button>
                    )}
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Products</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map(category => (
                                <tr key={category.id}>
                                    <td>
                                        <div className="product-cell">
                                            <div className="category-image-small">
                                                {category.imageUrl ? (
                                                    <img src={category.imageUrl} alt={category.name} />
                                                ) : (
                                                    <div className="placeholder-icon">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <span className="product-name">{category.name}</span>
                                                <span className="product-id">ID: {category.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <p className="description-text">{category.description || 'No description'}</p>
                                    </td>
                                    <td>
                                        <span className="stock">
                                            {category.productCount || 0}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions">
                                            <button
                                                className="action-btn edit"
                                                title="Edit"
                                                onClick={() => handleEdit(category)}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                title="Delete"
                                                onClick={() => handleDelete(category.id)}
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

            {/* Modal */}
            {isModalOpen && createPortal(
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content category-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Category Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Summer Collection"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        placeholder="Category description..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Image URL</label>
                                    <input
                                        type="text"
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                                {formData.imageUrl && (
                                    <div className="image-preview">
                                        <img src={formData.imageUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : (editingCategory ? 'Update Category' : 'Create Category')}
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

export default Categories;
