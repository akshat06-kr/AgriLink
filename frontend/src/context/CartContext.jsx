import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    const userRole = (user?.role || '').toUpperCase();
    if (!user || userRole !== 'CUSTOMER') {
      const localCart = localStorage.getItem('guest_cart');
      if (localCart) {
        try {
          setItems(JSON.parse(localCart));
        } catch {
          setItems([]);
        }
      } else {
        setItems([]);
      }
      return;
    }

    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data && Array.isArray(res.data.items)) {
        setItems(res.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch cart from server:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    const itemData = {
      product_id: product._id || product.id,
      name: product.name,
      price: product.price,
      market_price: product.market_price || product.price * 1.2,
      quantity: Number(quantity),
      unit: product.unit || 'kg',
      image: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : (product.image || '🌾'),
      farmer_name: product.farmer_name || 'Local Farmer',
      farmer_id: product.farmer_id || '',
      location: product.location || 'Local Farm',
      organic: Boolean(product.organic)
    };

    if (!user || user.role !== 'CUSTOMER') {
      // Manage in local storage for guest
      setItems(prev => {
        const existingIdx = prev.findIndex(it => it.product_id === itemData.product_id);
        let updated;
        if (existingIdx > -1) {
          updated = [...prev];
          updated[existingIdx].quantity += itemData.quantity;
        } else {
          updated = [...prev, itemData];
        }
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        return updated;
      });
      return { success: true, guest: true };
    }

    try {
      await api.post('/cart', itemData);
      await fetchCart();
      return { success: true };
    } catch (err) {
      console.error('Failed to add to cart:', err);
      // Optimistic update
      setItems(prev => {
        const idx = prev.findIndex(it => it.product_id === itemData.product_id);
        if (idx > -1) {
          const cp = [...prev];
          cp[idx].quantity += itemData.quantity;
          return cp;
        }
        return [...prev, itemData];
      });
      return { success: true };
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeFromCart(productId);
    }

    if (!user || user.role !== 'CUSTOMER') {
      setItems(prev => {
        const updated = prev.map(it => it.product_id === productId ? { ...it, quantity: newQuantity } : it);
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      await api.patch(`/cart/${productId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      setItems(prev => prev.map(it => it.product_id === productId ? { ...it, quantity: newQuantity } : it));
    }
  };

  const removeFromCart = async (productId) => {
    if (!user || user.role !== 'CUSTOMER') {
      setItems(prev => {
        const updated = prev.filter(it => it.product_id !== productId);
        localStorage.setItem('guest_cart', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    try {
      await api.delete(`/cart/${productId}`);
      await fetchCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
      setItems(prev => prev.filter(it => it.product_id !== productId));
    }
  };

  const clearCart = async () => {
    if (!user || user.role !== 'CUSTOMER') {
      setItems([]);
      localStorage.removeItem('guest_cart');
      return;
    }

    try {
      await api.delete('/cart');
      setItems([]);
    } catch (err) {
      console.error('Error clearing cart:', err);
      setItems([]);
    }
  };

  const totalItemsCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const distinctItemsCount = items.length;
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalMarketAmount = items.reduce((sum, item) => sum + ((item.market_price || item.price) * item.quantity), 0);
  const totalSavings = Math.max(0, totalMarketAmount - totalAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItemsCount,
        distinctItemsCount,
        totalAmount,
        totalMarketAmount,
        totalSavings,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
