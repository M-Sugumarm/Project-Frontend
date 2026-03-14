import { useState, useEffect } from 'react';
import { Search, Users as UsersIcon, Download, RefreshCw, Mail, Calendar, Shield, ShieldAlert, UserCheck } from 'lucide-react';
import { userApi } from '../../services/api';
import Loader from '../../components/common/Loader';
import './Orders.css'; // Reusing some table styles

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            if (users.length === 0) setLoading(true);
            const response = await userApi.getAll();
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const handleExport = () => {
        if (filteredUsers.length === 0) {
            alert('No users to export');
            return;
        }

        const headers = ['User ID', 'Name', 'Email', 'Role', 'Created At'];
        const csvRows = filteredUsers.map(user => [
            user.id,
            user.name || 'N/A',
            user.email,
            user.role || 'USER',
            user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredUsers = users.filter(user => {
        return (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (user.id && user.id.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    if (loading) {
        return <Loader size="lg" text="Loading users..." />;
    }

    return (
        <div className="orders-page">
            <div className="page-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage and export customer details ({users.length})</p>
                </div>
                <div className="header-actions">
                    <button
                        className={`btn btn-secondary ${refreshing ? 'refreshing' : ''}`}
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw size={18} /> {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button className="btn btn-primary" onClick={handleExport}>
                        <Download size={18} /> Export Users
                    </button>
                </div>
            </div>

            <div className="toolbar">
                <div className="search-box">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Name, Email or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User Details</th>
                            <th>Role</th>
                            <th>Date Joined</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="order-row">
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontWeight: 'bold', color: 'var(--color-gold)' }}>{user.name || 'Anonymous User'}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#888' }}>
                                                <Mail size={12} />
                                                <span>{user.email}</span>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#666' }}>ID: {user.id}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.role === 'ADMIN' ? 'delivered' : 'pending'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            {user.role === 'ADMIN' ? <Shield size={14} /> : <UserCheck size={14} />}
                                            {user.role || 'USER'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="date-info">
                                            <Calendar size={14} />
                                            <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge shipped">
                                            Active
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                    No users found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
