import { useState, useEffect } from 'react';
import {
    Package, ShoppingCart, Users, DollarSign, RefreshCw,
    ArrowRight, AlertTriangle, TrendingUp, Calendar,
    ChevronRight, Activity, TrendingDown, Clock,
    Download, Zap, Layers, Target, ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import api, { API_BASE_URL } from '../../services/api';
import Loader from '../../components/common/Loader';
import './Dashboard.css';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [overview, setOverview] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        revenueGrowth: 12.5,
        orderGrowth: 5.2
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);
    const [revenuePeriod, setRevenuePeriod] = useState('weekly');
    const [chartData, setChartData] = useState([]);

    const categoryData = [
        { name: 'Sarees', value: 45, color: '#D4AF37' },
        { name: 'Suits', value: 25, color: '#C0C0C0' },
        { name: 'Fabrics', value: 20, color: '#8E44AD' },
        { name: 'Others', value: 10, color: '#2C3E50' },
    ];

    // Removed hardcoded periodicData

    const fetchDashboardData = async () => {
        try {
            const [overviewRes, ordersRes, inventoryRes, salesRes] = await Promise.all([
                api.get('/analytics/overview').catch(() => ({ data: { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0 } })),
                api.get('/analytics/recent-orders?limit=6').catch(() => ({ data: [] })),
                api.get('/inventory?limit=5').catch(() => ({ data: [] })),
                api.get(`/analytics/sales?period=${revenuePeriod}`).catch(() => ({ data: [] }))
            ]);

            setOverview(prev => ({ ...prev, ...overviewRes.data }));
            setRecentOrders(ordersRes.data);
            setChartData(salesRes.data || []);

            const lowStock = (inventoryRes.data || []).filter(p => p.stock < 10).slice(0, 5);
            setLowStockItems(lowStock);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [revenuePeriod]);

    useEffect(() => {
        fetchDashboardData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        const interval = setInterval(fetchDashboardData, 60000);

        // Real-time EventSource connection
        const sse = new EventSource(`${API_BASE_URL}/admin/stream`);

        sse.addEventListener('NEW_ORDER', (event) => {
            console.log("New order received in realtime:", event.data);
            // Flash refreshing state and fetch latest data
            setRefreshing(true);
            fetchDashboardData();
        });

        sse.onerror = (error) => {
            console.error("SSE connection error:", error);
            sse.close();
            // Optional: try reconnecting after a delay, though EventSource handles some built-in reconnects
        };

        return () => {
            clearInterval(timer);
            clearInterval(interval);
            sse.close();
        };
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return <Loader size="lg" text="Preparing your command center..." />;
    }

    return (
        <motion.div
            className="dashboard-premium"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Glassmorphic Header / Hero Section */}
            <motion.div className="welcome-hero" variants={itemVariants}>
                <div className="hero-content">
                    <div className="hero-text">
                        <span className="greeting-pill">Systems Online • Stable</span>
                        <h1>Luxury Textile Control</h1>
                        <p>Welcome back, Admin. Here's what's happening today.</p>
                    </div>
                    <div className="hero-stats-mini">
                        <div className="current-timer">
                            <Clock size={16} />
                            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <button
                            className={`refresh-fab ${refreshing ? 'refreshing' : ''}`}
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Premium Stats Grid */}
            <div className="stats-grid-premium">
                {[
                    { title: 'Total Revenue', value: `₹${(overview.totalRevenue / 1000).toFixed(1)}K`, growth: overview.revenueGrowth, icon: <DollarSign />, color: 'gold' },
                    { title: 'Active Orders', value: overview.totalOrders, growth: overview.orderGrowth, icon: <ShoppingCart />, color: 'blue' },
                    { title: 'Total Inventory', value: overview.totalProducts, growth: -2.4, icon: <Package />, color: 'green' }
                ].map((stat, idx) => (
                    <motion.div key={idx} className={`stat-card-glass ${stat.color}`} variants={itemVariants} whileHover={{ y: -5 }}>
                        <div className="stat-card-header">
                            <div className="stat-icon-box">{stat.icon}</div>
                            <div className={`growth-indicator ${stat.growth >= 0 ? 'up' : 'down'}`}>
                                {stat.growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                <span>{Math.abs(stat.growth)}%</span>
                            </div>
                        </div>
                        <div className="stat-card-body">
                            <h3>{stat.title}</h3>
                            <p className="big-value">{stat.value}</p>
                        </div>
                        <div className="stat-card-footer">
                            <div className="mini-progress-bar">
                                <div className="progress-fill" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Visual Analytics Row */}
            <div className="analytics-row">
                <motion.div className="chart-card-glass revenue-chart" variants={itemVariants}>
                    <div className="card-header-premium">
                        <h3>Revenue Insights</h3>
                        <div className="chart-actions">
                            <button
                                className={revenuePeriod === 'weekly' ? 'active' : ''}
                                onClick={() => setRevenuePeriod('weekly')}
                            >
                                Weekly
                            </button>
                            <button
                                className={revenuePeriod === 'monthly' ? 'active' : ''}
                                onClick={() => setRevenuePeriod('monthly')}
                            >
                                Monthly
                            </button>
                        </div>
                    </div>
                    <div className="chart-container-premium">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#F1E4C1', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#F1E4C1', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid var(--color-gold)',
                                        borderRadius: '12px',
                                        color: '#F1E4C1'
                                    }}
                                    itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div className="chart-card-glass distribution-chart" variants={itemVariants}>
                    <div className="card-header-premium">
                        <h3>Inventory Split</h3>
                        <Activity size={18} className="text-gold" />
                    </div>
                    <div className="chart-container-premium">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#FFFFFF', fontSize: 13, fontWeight: 500 }}
                                    width={90}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid var(--color-gold)',
                                        borderRadius: '12px',
                                        color: '#FFFFFF'
                                    }}
                                    itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                                    formatter={(value) => [`${value} Items`, 'Stock']}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Operational Lists */}
            <div className="ops-grid-premium">
                <motion.div className="ops-card-premium" variants={itemVariants}>
                    <div className="card-header-premium">
                        <div className="title-with-icon">
                            <ShoppingCart size={20} className="text-blue" />
                            <h3>Recent Transactions</h3>
                        </div>
                        <Link to="/admin/orders" className="btn-icon-text">
                            History <ChevronRight size={16} />
                        </Link>
                    </div>
                    <div className="premium-list">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order, idx) => (
                                <div key={order.id} className="premium-list-item">
                                    <div className="item-meta-start">
                                        <div className="avatar-placeholder">{order.customerName?.[0] || 'G'}</div>
                                        <div className="name-id">
                                            <span className="name">{order.customerName || 'Guest Customer'}</span>
                                            <span className="id">#{order.id?.substring(0, 8) || '...'}</span>
                                        </div>
                                    </div>
                                    <div className="item-meta-end">
                                        <span className="amount">₹{order.totalAmount || order.total}</span>
                                        <span className={`status-badge-premium ${order.status?.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state-premium">
                                <Calendar size={40} />
                                <p>No orders recorded in the last 24h</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div className="ops-card-premium" variants={itemVariants}>
                    <div className="card-header-premium">
                        <div className="title-with-icon">
                            <AlertTriangle size={20} className="text-red" />
                            <h3>Attention Required</h3>
                        </div>
                    </div>
                    <div className="premium-list">
                        {lowStockItems.length > 0 ? (
                            lowStockItems.map((item, idx) => (
                                <div key={item.id} className="premium-list-item">
                                    <div className="item-meta-start">
                                        <div className="warn-icon-box"><Package size={18} /></div>
                                        <div className="name-id">
                                            <span className="name">{item.name}</span>
                                            <span className="id">Category: {item.category?.name || 'Textile'}</span>
                                        </div>
                                    </div>
                                    <div className="item-meta-end">
                                        <div className="stock-level-indicator">
                                            <span className="stock-count">{item.stock}</span>
                                            <span className="stock-label">LOW</span>
                                        </div>
                                        <Link to={`/admin/inventory`} className="action-circle-btn">
                                            <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state-success-premium">
                                <div className="success-glow">
                                    <TrendingUp size={32} />
                                </div>
                                <p>All inventory levels optimum</p>
                                <span className="sub-text">Efficiency at 100%</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
