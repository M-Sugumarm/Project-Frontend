import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import About from './pages/About';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import Orders from './pages/admin/Orders';
import Categories from './pages/admin/Categories';
import AdminBundles from './pages/admin/AdminBundles';
import Users from './pages/admin/Users';
import AdminProtectedRoute from './components/auth/AdminProtectedRoute';
import SplashScreen from './components/common/SplashScreen';
import AIChatbot from './components/common/AIChatbot';
import React, { useState, useEffect } from 'react';
import MyOrders from './pages/MyOrders';
import './App.css';

// Wrapper component to handle layout with conditional splash screen
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash && isHome) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // Admin routes should not have the main app layout wrapper
  if (location.pathname.startsWith('/admin')) {
    return (
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="bundles" element={<AdminBundles />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="inventory" element={<InventoryManagement />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/categories" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/about" element={<About />} />
        <Route path="/my-orders" element={<MyOrders />} />
        {/* Fallback route */}
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
      {/* AI Fashion Stylist Chatbot */}
      <AIChatbot />
    </div>
  );
};

function App() {
  return (
    <CartProvider>
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;
